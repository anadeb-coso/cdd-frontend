import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Box } from 'native-base';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTaskStatusColor } from '../../utils/colors';
import { getData } from '../../utils/storageManager';
import {
  distinctFilterOptionsById, distinctFilterOptionsByName, filterInvestmentCycleTasks,
} from '../../utils/functions';
import SectionedMultiSelectCustom from '../../components/SectionedMultiSelectCustom';

function InvestmentCycleDiagnosticList({ navigation, route }: { navigation: any; route: any; }) {
  const { t } = useTranslation(['investment_cycle_diagnostic', 'common']);
  const tasks: any[] = route.params?.tasks ?? [];
  const [currentDb, setCurrentDb] = useState<any>(null);

  const [adminLevelsSelected, setAdminLevelsSelected]: any = useState([]);
  const [phasesSelected, setPhasesSelected]: any = useState([]);
  const [activitiesSelected, setActivitiesSelected]: any = useState([]);
  const [tasksSelected, setTasksSelected]: any = useState([]);

  useEffect(() => {
    (async () => {
      setCurrentDb(JSON.parse(await getData('no_sql_db_name')));
    })();
  }, []);

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

  const renderItem = (item: any, index: number) => (
    <TouchableOpacity
      key={`${item._id}${index}`}
      style={styles.item}
      onPress={() => navigation.navigate('TaskStatusDetail', {
        _id: item._id,
        no_sql_db_name: item.no_sql_db_name,
        hide_button: item.no_sql_db_name !== currentDb,
      })}
    >
      <Text>{item.name}</Text>
      <Text style={styles.subTitle}>{item.phase_name} {' > '} {item.activity_name}</Text>
      <View style={styles.rowBetween}>
        <Box rounded="sm" style={{ flexDirection: 'row' }}>
          <Image
            resizeMode="stretch"
            style={{ width: 25, height: 30 }}
            source={require('../../../assets/illustrations/location.png')}
          />
          <Text style={{ ...styles.subTitle, marginTop: 8, marginLeft: 2 }}>
            {item.administrative_level_name ?? t('common:not_found')}
          </Text>
        </Box>
        <MaterialCommunityIcons name="chevron-right-circle" size={24} color={getTaskStatusColor(item)} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={{ paddingTop: 7, paddingHorizontal: 10 }}>
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
      <View style={{ flexDirection: 'row', marginTop: 8, marginBottom: 12 }}>
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

      {filteredTasks.length === 0
        ? <Text style={styles.noResults}>{t('investment_cycle_diagnostic.no_tasks_found')}</Text>
        : filteredTasks.map((task: any, index: number) => renderItem(task, index))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 15,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f6f6f6',
  },
  subTitle: {
    fontSize: 12,
    color: '#707070',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  noResults: {
    textAlign: 'center',
    color: '#707070',
    marginTop: 30,
  },
});

export default InvestmentCycleDiagnosticList;
