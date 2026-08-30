import React, { useState, useEffect } from 'react';
import { View, RefreshControl, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Content from './components/Content';
import { fetchAllUserTasksAcrossDbs } from '../../utils/coucdb_call';
import { classifyTaskStatus } from '../../utils/functions';
import { handleStorageError } from '../../utils/pouchdb_call';

// Ne garde que les champs utiles à l'affichage/aux filtres/à la navigation, et remplace
// form_response/actions_by/attachments (potentiellement volumineux) par le statut déjà calculé :
// ce tableau est ensuite passé à d'autres écrans via les paramètres de navigation.
const toLightweightTask = (doc: any) => ({
  _id: doc._id,
  no_sql_db_name: doc.no_sql_db_name,
  name: doc.name,
  sql_id: doc.sql_id,
  task_order: doc.task_order,
  phase_id: doc.phase_id,
  phase_name: doc.phase_name,
  activity_id: doc.activity_id,
  activity_name: doc.activity_name,
  administrative_level_id: doc.administrative_level_id,
  administrative_level_name: doc.administrative_level_name,
  completed: doc.completed,
  validated: doc.validated,
  status: classifyTaskStatus(doc),
  has_form_response: doc.form_response && Object.keys(doc.form_response).length > 0,
  updated_after_invalidation: doc.updated_after_invalidation ?? undefined,
});

function InvestmentCycleDiagnostic({ navigation }: { navigation: any; route: any; }) {
  const [tasks, setTasks]: any = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const get_tasks = async () => {
    try {
      const docs = await fetchAllUserTasksAcrossDbs();
      setTasks(docs.map(toLightweightTask));
    } catch (error) {
      handleStorageError(error);
      setTasks([]);
    }
  };

  useEffect(() => {
    get_tasks();
    const unsubscribe = navigation.addListener('focus', () => {
      get_tasks();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    get_tasks();
    setRefreshing(false);
  };

  if (tasks == null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#24c38b" />
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Content tasks={tasks} />
    </ScrollView>
  );
}

export default InvestmentCycleDiagnostic;
