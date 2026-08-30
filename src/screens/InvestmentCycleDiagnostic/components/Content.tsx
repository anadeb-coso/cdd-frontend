import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Box, VStack, Text, Pressable } from 'native-base';
import { StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../types/navigation';
import { colors } from '../../../utils/colors';
import {
  aggregateTaskCounts, distinctFilterOptionsById, distinctFilterOptionsByName, filterInvestmentCycleTasks,
} from '../../../utils/functions';
import SectionedMultiSelectCustom from '../../../components/SectionedMultiSelectCustom';

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function StatTile({ label, value, onPress, color }: { label: string; value: number; onPress: () => void; color?: string | undefined }) {
  let textColor = (value ?? 0) > 0 ? (color ?? 'black') : 'gray';
  return (
    <Pressable style={styles.statTile} onPress={onPress}>
      <Text style={[styles.statCount, { borderBottomColor: textColor, color: textColor }]}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function Content({ tasks }: { tasks: any[] }) {
  const { t } = useTranslation(['investment_cycle_diagnostic', 'common']);
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();

  const [adminLevelsSelected, setAdminLevelsSelected]: any = useState([]);
  const [phasesSelected, setPhasesSelected]: any = useState([]);
  const [activitiesSelected, setActivitiesSelected]: any = useState([]);
  const [tasksSelected, setTasksSelected]: any = useState([]);

  const adminLevelOptions = useMemo(
    () => distinctFilterOptionsById(tasks, 'administrative_level_id', 'administrative_level_name'),
    [tasks]
  );
  const phaseOptions = useMemo(
    () => distinctFilterOptionsByName(tasks, 'phase_name'),
    [tasks]
  );
  const activityOptions = useMemo(
    () => distinctFilterOptionsByName(tasks, 'activity_name'),
    [tasks]
  );
  const taskOptions = useMemo(
    () => distinctFilterOptionsByName(tasks, 'name'),
    [tasks]
  );

  const filteredTasks = useMemo(() => filterInvestmentCycleTasks(tasks, {
    administrativeLevelIds: adminLevelsSelected,
    phaseNames: phasesSelected,
    activityNames: activitiesSelected,
    taskNames: tasksSelected,
  }), [tasks, adminLevelsSelected, phasesSelected, activitiesSelected, tasksSelected]);

  const counts: any = useMemo(() => aggregateTaskCounts(filteredTasks), [filteredTasks]);

  const goToList = (categoryKey: string, name: string) => {
    navigation.navigate('InvestmentCycleDiagnosticList', {
      tasks: counts[categoryKey] ?? [],
      name,
    });
  };

  const TILES = [
    // { key: 'invalidated_total', label: t('investment_cycle_diagnostic.invalidated_total_label'), color: 'red' },
    { key: 'invalidated_unreviewed', label: t('investment_cycle_diagnostic.invalidated_unreviewed_label'), color: 'red' },
    { key: 'not_started', label: t('investment_cycle_diagnostic.not_started_label'), color: 'gray' },
    { key: 'invalidated_resubmitting', label: t('investment_cycle_diagnostic.invalidated_resubmitting_label'), color: 'red' },
    { key: 'in_progress', label: t('investment_cycle_diagnostic.in_progress_label'), color: 'blue' },
    { key: 'invalidated_updated', label: t('investment_cycle_diagnostic.invalidated_updated_label'), color: 'purple' },
    { key: 'completed_pending_validation', label: t('investment_cycle_diagnostic.completed_pending_validation_label'), color: 'orange' },
    { key: 'total', label: t('investment_cycle_diagnostic.total_label'), color: 'black' },
    { key: 'completed_total', label: t('investment_cycle_diagnostic.completed_total_label'), color: 'orange' },
    { key: 'validated', label: t('investment_cycle_diagnostic.validated_label'), color: 'green' },
  ];

  return (
    <Box style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 30 }}>
      <SectionTitle>{t('investment_cycle_diagnostic.filters_title')}</SectionTitle>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 0.5, paddingRight: 4 }}>
          <SectionedMultiSelectCustom
            id="id"
            K_OPTIONS={adminLevelOptions}
            items={adminLevelOptions}
            itemsSelected={adminLevelsSelected}
            setItemsSelected={setAdminLevelsSelected}
            title={t('investment_cycle_diagnostic.filter_admin_level_title')}
          />
        </View>
        <View style={{ flex: 0.5, paddingLeft: 4 }}>
          <SectionedMultiSelectCustom
            id="id"
            K_OPTIONS={phaseOptions}
            items={phaseOptions}
            itemsSelected={phasesSelected}
            setItemsSelected={setPhasesSelected}
            title={t('investment_cycle_diagnostic.filter_phase_title')}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 16 }}>
        <View style={{ flex: 0.5, paddingRight: 4 }}>
          <SectionedMultiSelectCustom
            id="id"
            K_OPTIONS={activityOptions}
            items={activityOptions}
            itemsSelected={activitiesSelected}
            setItemsSelected={setActivitiesSelected}
            title={t('investment_cycle_diagnostic.filter_activity_title')}
          />
        </View>
        <View style={{ flex: 0.5, paddingLeft: 4 }}>
          <SectionedMultiSelectCustom
            id="id"
            K_OPTIONS={taskOptions}
            items={taskOptions}
            itemsSelected={tasksSelected}
            setItemsSelected={setTasksSelected}
            title={t('investment_cycle_diagnostic.filter_task_title')}
          />
        </View>
      </View>

      <SectionTitle>{t('investment_cycle_diagnostic.statuses_title')}</SectionTitle>
      <VStack space={2}>
        {TILES.map((tile) => (
          <StatTile
            key={tile.key}
            label={tile.label}
            value={counts[tile.key]?.length ?? 0}
            onPress={() => goToList(tile.key, tile.label)}
            color={tile.color}
          />
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
  statTile: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    width: 44,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  statLabel: {
    flex: 1,
    fontSize: 13,
    color: '#707070',
  },
});

export default Content;
