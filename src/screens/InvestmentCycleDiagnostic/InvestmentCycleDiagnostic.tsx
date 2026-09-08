import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, RefreshControl, ScrollView, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import Content from './components/Content';
import { fetchAllUserTasksAcrossDbs } from '../../utils/coucdb_call';
import { classifyTaskStatus } from '../../utils/functions';
import { getData } from '../../utils/storageManager';
import { handleStorageError } from '../../utils/pouchdb_call';

// Ne garde que les champs utiles à l'affichage/aux filtres/à la navigation, et remplace
// form_response/actions_by/attachments (potentiellement volumineux) par le statut déjà calculé :
// ce tableau est ensuite passé à d'autres écrans via les paramètres de navigation.
const toLightweightTask = (doc: any) => ({
  _id: doc._id,
  no_sql_db_name: doc.no_sql_db_name,
  project_name: doc.project_name,
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

function InvestmentCycleDiagnostic({ navigation, route }: { navigation: any; route: any; }) {
  const { t } = useTranslation(['investment_cycle_diagnostic', 'common']);
  // scope: 'global' (toutes bases / tous projets, comportement historique) ou 'project'
  // (limité au projet courant). Par défaut 'global' pour rester rétro-compatible.
  const scope: 'global' | 'project' = route.params?.scope === 'project' ? 'project' : 'global';
  const [tasks, setTasks]: any = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [projectName, setProjectName] = useState<string | null>(null);

  const get_tasks = async () => {
    try {
      const project = JSON.parse(await getData('project'));
      setProjectName(project?.name ?? null);
      const docs = await fetchAllUserTasksAcrossDbs();
      let scopedDocs = docs;
      if (scope === 'project' && project?.name) {
        scopedDocs = docs.filter((doc: any) => doc.project_name === project.name);
      }
      setTasks(scopedDocs.map(toLightweightTask));
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
        <ActivityIndicator size="large" color="#24c38b" />
        <Text style={{ marginTop: 16, textAlign: 'center', color: '#707070', fontSize: 13 }}>
          {t('investment_cycle_diagnostic.loading_hint')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ paddingHorizontal: 12, paddingTop: 10, color: '#24c38b', fontWeight: 'bold', fontSize: 13 }}>
        {t('investment_cycle_diagnostic.current_project_label', {
          name: projectName || t('common:not_found'),
        })}
      </Text>
      <Content tasks={tasks} />
    </ScrollView>
  );
}

export default InvestmentCycleDiagnostic;
