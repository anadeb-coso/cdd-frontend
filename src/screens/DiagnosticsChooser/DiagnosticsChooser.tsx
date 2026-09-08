import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, VStack } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { getData } from '../../utils/storageManager';

function DiagnosticsChooser({ navigation }: { navigation: any; route: any; }) {
  const { t } = useTranslation(['core', 'common']);
  const [projectName, setProjectName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const project = JSON.parse(await getData('project'));
      setProjectName(project?.name ?? null);
    })();
  }, []);

  const options = [
    {
      key: 'subprojects',
      icon: 'domain',
      label: t('home.diagnostics_chooser_subprojects_label'),
      subtitle: projectName
        ? t('home.diagnostics_chooser_current_project_label', { name: projectName })
        : t('home.diagnostics_chooser_no_project'),
      route: 'DiagnosticActivities',
      params: undefined as any,
    },
    // {
    //   key: 'investment_cycle_global',
    //   icon: 'chart-timeline-variant',
    //   label: t('home.diagnostics_chooser_investment_cycle_global_label'),
    //   subtitle: t('home.diagnostics_chooser_global_subtitle'),
    //   route: 'InvestmentCycleDiagnostic',
    //   params: { scope: 'global' },
    // },
    {
      key: 'investment_cycle_project',
      icon: 'chart-box-outline',
      label: t('home.diagnostics_chooser_investment_cycle_project_label'),
      subtitle: projectName
        ? t('home.diagnostics_chooser_current_project_label', { name: projectName })
        : t('home.diagnostics_chooser_no_project'),
      route: 'InvestmentCycleDiagnostic',
      params: { scope: 'project' },
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={styles.card}
          onPress={() => navigation.navigate(option.route, option.params)}
        >
          <VStack space={2} alignItems="center">
            <MaterialCommunityIcons name={option.icon as any} size={40} color={colors.primary} />
            <Text style={styles.cardLabel}>{option.label}</Text>
            {!!option.subtitle && <Text style={styles.cardSubtitle}>{option.subtitle}</Text>}
          </VStack>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 26,
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#373737',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#707070',
    textAlign: 'center',
  },
});

export default DiagnosticsChooser;
