import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, RefreshControl, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
// import LocalDatabase from '../../utils/databaseManager';
import { getDocumentsByAttributes } from '../../utils/coucdb_call';
import Content from './containers/Content';
import AuthContext from '../../contexts/auth';
import { handleStorageError } from '../../utils/pouchdb_call';

function TaskDiagnostic() {
  const { signOut } = useContext(AuthContext);
  const [tasks, setTasks]: any = useState(null);
  const [cvds, setCvds] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getTasksWithCVD = () => {
    setTasks(null);
    try {
      // LocalDatabase.find({
      //   selector: { type: 'task' },
      // })
      getDocumentsByAttributes({ type: 'task' })
        .then((result: any) => {
          let tasksResults = result?.docs ?? [];

          //sort the tasks by order
          tasksResults.sort(function (a: any, b: any) {
            var keyA = (String(a.task_order ?? 0) + (a.administrative_level_name ?? ""));
            var keyB = (String(b.task_order ?? 0) + (b.administrative_level_name ?? ""));
            // Compare the 2 values
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
          });

          setTasks(tasksResults);

        })
        .catch((err: any) => {
          setTasks([]);
          handleStorageError(err);
          // if (LocalDatabase._destroyed) {
          //   signOut();
          // }
        });
    } catch (error) {
      handleStorageError(error);
    }

    try {
      // LocalDatabase.find({
      //   selector: { type: 'facilitator' },
      // })
      getDocumentsByAttributes({ type: 'facilitator' })
        .then((result: any) => {
          const villagesResult = result?.docs[0]?.administrative_levels ?? [];
          const geographical_units = result?.docs[0]?.geographical_units ?? [];

          let CVDs: any = [];
          let villages: any;
          geographical_units.forEach((element: any, index: number) => {
            element["cvd_groups"].forEach((elt: any, i: number) => {
              villages = []
              for (let _index = 0; _index < villagesResult.length; _index++) {
                if (elt.villages && elt.villages.includes(villagesResult[_index].id)) {
                  villages.push(villagesResult[_index]);
                  if (villagesResult[_index].is_headquarters_village == true) {
                    elt.village = villagesResult[_index];
                  }
                }
              }
              elt.villages = villages;
              elt.unit = element.name;
              CVDs.push(elt);
            });
          });

          setCvds(CVDs);
        })
        .catch((err: any) => {
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
    getTasksWithCVD();
  }, []);



  const onRefresh = () => {
    setRefreshing(true);
    getTasksWithCVD();
    setRefreshing(false);
  };

  if (tasks == null || cvds == null)
    return <ActivityIndicator style={{ marginTop: 50 }} size="small" />;

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{ padding: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Content tasks={tasks} cvds={cvds} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default TaskDiagnostic;
