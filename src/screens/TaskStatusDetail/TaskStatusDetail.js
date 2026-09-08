import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, RefreshControl, ScrollView } from "react-native";
import { useToast } from 'native-base';
import { useTranslation } from 'react-i18next';
import Content from "./containers/Content";
import { ActivityIndicator } from 'react-native-paper';
import { styles } from "./TaskStatusDetail.styles";
// import LocalDatabase from '../../utils/databaseManager';
import { getDocumentsByAttributes } from '../../utils/coucdb_call';
import { getData, storeData } from '../../utils/storageManager';
import AuthContext from '../../contexts/auth';
import { handleStorageError } from '../../utils/pouchdb_call';

const TaskStatusDetail = ({ route, navigation }) => {
  const { signOut } = useContext(AuthContext);
  const { params } = route;
  const { t } = useTranslation(['core', 'common']);
  const toast = useToast();
  const customStyles = styles();
  const [task, setTask] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [currentDb, setCurrentDb] = useState(null);

  // Base de données à laquelle appartient la tâche (transmise par l'écran appelant).
  const taskDb = params?.no_sql_db_name ?? null;

  const loadContext = async () => {
    setCurrentProject(JSON.parse(await getData('project')));
    setCurrentDb(JSON.parse(await getData('no_sql_db_name')));
  };

  const getTask = () => {
    setTask(null);
    try {
      // LocalDatabase.find({
      //   selector: { type: 'task', _id: params._id },
      // })
      // skip_filter = true : on récupère la tâche par son _id même si elle appartient
      // à un autre projet que le projet courant (sinon le filtre project_name injecté
      // automatiquement empêcherait de la retrouver).
      getDocumentsByAttributes({ type: 'task', _id: params._id }, 250, 0, taskDb, true)
        .then((result) => {
          setTask({ ...(result?.docs ?? [])[0], cvd: params.cvd });
        })
        .catch((err) => {
          handleStorageError(err);
          // if (LocalDatabase._destroyed) {
          //   signOut();
          // }
        });
    } catch (error) {
      handleStorageError(error);
    }
  }

  useEffect(() => {
    loadContext();
    getTask();
    // Recharge le projet / la base courante quand l'écran reprend le focus
    // (ex : retour depuis "Changer de projet"), afin que l'avertissement et le
    // bouton "Ouvrir la tâche" reflètent l'état à jour.
    const unsubscribe = navigation?.addListener?.('focus', () => {
      loadContext();
    });
    return unsubscribe;
  }, [navigation]);


  const onRefresh = () => {
    setRefreshing(true);
    loadContext();
    getTask();
    setRefreshing(false);
  };

  // Bascule effective de la base de données active vers celle de la tâche.
  const switchToTaskDb = async () => {
    if (!taskDb) return;
    await storeData('no_sql_db_name', JSON.stringify(taskDb));
    await storeData('infos_changed', true);
    toast.show({
      description: t('task_status_detail.switch_db_success', { db: taskDb }),
      duration: 5000,
    });
    // Le document de la tâche est inchangé : on rafraîchit seulement le contexte
    // (projet / base courante) pour recalculer l'avertissement et réafficher le bouton.
    await loadContext();
  };


  if (task == null)
    return <ActivityIndicator style={{ marginTop: 50 }} size="small" />;

  const taskProjectName = task?.project_name ?? null;
  const projectMismatch = !!(taskProjectName && currentProject?.name && taskProjectName !== currentProject.name);
  const dbMismatch = !!(taskDb && currentDb && taskDb !== currentDb);

  return (
    <SafeAreaView style={customStyles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Content
          task={task}
          hide_button={params?.hide_button || false}
          currentProjectName={currentProject?.name ?? null}
          taskProjectName={taskProjectName}
          currentDbName={currentDb}
          taskDbName={taskDb}
          projectMismatch={projectMismatch}
          dbMismatch={dbMismatch}
          onSwitchToTaskDb={switchToTaskDb}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskStatusDetail;
