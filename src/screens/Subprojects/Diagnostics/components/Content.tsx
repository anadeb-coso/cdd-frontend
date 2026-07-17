import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, HStack, VStack, Text, Pressable } from 'native-base';
import { StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../../types/navigation';
import { colors } from '../../../../utils/colors';
import { getData } from '../../../../utils/storageManager';

const ANOMALY_TILES = [
  { key: 'completed_missing_images_count', filter_type: 'completed_missing_images', label: "Achevées avec moins de 3 images" },
  { key: 'completed_missing_geoloc_count', filter_type: 'completed_missing_geoloc', label: "Achevées sans coordonnées" },
  { key: 'in_progress_missing_current_image_count', filter_type: 'in_progress_missing_current_image', label: "En cours sans image au niveau actuel" },
  { key: 'in_progress_missing_geoloc_count', filter_type: 'in_progress_missing_geoloc', label: "En cours sans coordonnées" },
  { key: 'invalidated_files_infrastructures_count', filter_type: 'invalidated_files', label: "Infrastructures avec fichiers invalidés" },
  { key: 'stalled_in_progress_count', filter_type: 'stalled_in_progress', label: "En cours non mises à jour depuis plus de 2 semaines" },
  { key: 'abandoned_count', filter_type: 'abandoned', label: "Chantiers abandonnés" },
  { key: 'interrupted_count', filter_type: 'interrupted', label: "Chantiers interrompus" },
  { key: 'contracts_currently_terminated_count', filter_type: 'contracts_currently_terminated', label: "Contrats résiliés actuellement" },
  { key: 'unapproved_infrastructure_count', filter_type: 'unapproved_infrastructure', label: "Infrastructures non approuvées" },
];

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function InfoTile({ label, value }: { label: string; value: number }) {
  return (
    <VStack style={styles.infoTile}>
      <Text style={styles.infoValue}>{value ?? 0}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </VStack>
  );
}

function Content({ summary }: { summary: any }) {
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const [project, setProject] = useState<any>(null);

  if (!summary) {
    return null;
  }

  const coverage = summary.coverage ?? {};
  const totals = summary.totals ?? {};
  const status_breakdown = summary.status_breakdown ?? [];
  const anomalies = summary.anomalies ?? {};

  const get_project = async () => {
    setProject(JSON.parse(await getData('project')));
  }

  const goToList = (params: { filter_type: string; status?: string; designation: string | null; name: string }) => {
    navigation.navigate('DiagnosticActivitiesList', params);
  };

  useEffect(() => {
        get_project();
    }, []);

  return (
    <Box style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 30 }}>

      <SectionTitle>{project && project.name ? `Zone d'intervention : ${project.name}` : "Zone d'intervention"}</SectionTitle>
      <HStack space={2} style={{ marginBottom: 16 }}>
        <InfoTile label="Cantons" value={coverage.cantons_count} />
        <InfoTile label="CVD" value={coverage.cvds_count} />
        <InfoTile label="Villages" value={coverage.villages_count} />
      </HStack>

      <SectionTitle>Sous-projets / Infrastructures</SectionTitle>
      <HStack space={2} style={{ marginBottom: 16 }}>
        <InfoTile label="Sous-projets" value={totals.subprojects_count} />
        <InfoTile label="Infrastructures" value={totals.infrastructures_count} />
        <InfoTile label="Infrastructures Non comptabilisées" value={totals.un_infrastructures_count} />
      </HStack>

      <SectionTitle>Statuts</SectionTitle>
      <VStack style={{ marginBottom: 16 }}>
        <HStack style={styles.statusHeaderRow}>
          <Text style={[styles.statusHeaderText, { flex: 1 }]}>Statut</Text>
          <Text style={[styles.statusHeaderText, { width: 70, textAlign: 'center' }]}>Sous-projets</Text>
          <Text style={[styles.statusHeaderText, { width: 70, textAlign: 'center' }]}>Infras</Text>
          <Text style={[styles.statusHeaderText, { width: 70, textAlign: 'center' }]}>Infras Non compt.</Text>
        </HStack>
        {status_breakdown.map((row: any) => (
          <HStack key={row.status} style={styles.statusRow}>
            <Text style={{ flex: 1 }}>{row.status == 'Identifié' ? 'Travaux non démarrés' : (row.status == 'En cours' ? 'Travaux en cours' : row.status)}</Text>
            <Pressable
              style={{ width: 70, alignItems: 'center' }}
              onPress={() => goToList({
                filter_type: 'status',
                status: row.status,
                designation: 'subproject',
                name: `Sous-projets - ${row.status}`,
              })}
            >
              <Text style={styles.statusCount}>{row.subprojects_count}</Text>
            </Pressable>
            <Pressable
              style={{ width: 70, alignItems: 'center' }}
              onPress={() => goToList({
                filter_type: 'status',
                status: row.status,
                designation: 'infrastructure',
                name: `Infrastructures - ${row.status}`,
              })}
            >
              <Text style={styles.statusCount}>{row.infrastructures_count}</Text>
            </Pressable>
            <Pressable
              style={{ width: 70, alignItems: 'center' }}
              onPress={() => goToList({
                filter_type: 'status',
                status: row.status,
                designation: 'un_infrastructure',
                name: `Infras Non comptabilisées - ${row.status}`,
              })}
            >
              <Text style={styles.statusCount}>{row.un_infrastructures_count}</Text>
            </Pressable>
          </HStack>
        ))}
      </VStack>

      <SectionTitle>Points d'attention</SectionTitle>
      <VStack space={2}>
        {ANOMALY_TILES.map((tile) => (
          <Pressable
            key={tile.key}
            style={styles.anomalyTile}
            onPress={() => goToList({
              filter_type: tile.filter_type,
              designation: null,
              name: tile.label,
            })}
          >
            <Text style={styles.anomalyCount}>{anomalies[tile.key] ?? 0}</Text>
            <Text style={styles.anomalyLabel}>{tile.label}</Text>
          </Pressable>
        ))}
      </VStack>

    </Box>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#707070',
    marginBottom: 8,
    marginTop: 4,
  },
  infoTile: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  infoValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoLabel: {
    fontSize: 12,
    color: '#707070',
    marginTop: 4,
    textAlign: 'center',
  },
  statusHeaderRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#dedede',
  },
  statusHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#707070',
  },
  statusRow: {
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#f6f6f6',
  },
  statusCount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
  },
  anomalyTile: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  anomalyCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    width: 44,
  },
  anomalyLabel: {
    flex: 1,
    fontSize: 13,
    color: '#707070',
  },
});

export default Content;
