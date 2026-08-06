import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, RefreshControl, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
// import LocalDatabase from '../../utils/databaseManager';
import { getDocumentsByAttributes } from '../../utils/coucdb_call';
import { getEadlByEmail } from '../../services/facilitators/eadl';
import Content from './containers/Content';
import AuthContext from '../../contexts/auth';
import { handleStorageError } from '../../utils/pouchdb_call';
import { getData } from '../../utils/storageManager';
import { clear_duplicate_on_liste } from '../../utils/functions';

function TaskDiagnostic() {
  const { signOut } = useContext(AuthContext);
  const [tasks, setTasks]: any = useState(null);
  const [cvds, setCvds] = useState(null);
  const [refreshing, setRefreshing] = useState(false);


  async function villages_stabilized(email: any) {
    if (JSON.parse(await getData('no_sql_user'))) {

      let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
      let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));

      if (my_no_sql_db_name != no_sql_db_name) { //villagesStabilized == null && 
        email = email == null ? `${JSON.parse(await getData('email'))}` : email;
        try {

          let villagesResult: any = [];
          await getEadlByEmail(email)
            .then((response: any) => {
              if (response.docs && response.docs[0] && response.docs[0].administrative_regions_objects) {
                response.docs[0].administrative_regions_objects.forEach((elt: any) => {
                  if (elt.villages) villagesResult = villagesResult.concat(elt.villages.map((elt: any) => {
                    return {
                      id: String(elt.id),
                      name: elt.name
                    };
                  }));
                });
              }
              villagesResult = clear_duplicate_on_liste(villagesResult);
            }).catch((err: any) => {
              console.log("Error1 : " + err);
              handleStorageError(err);
            });

          return {
            villages: villagesResult,
            facilitator: null
          }

        } catch (error) {
          handleStorageError(error);
        }
      }

    }
  }


  const getTasksWithCVD = async () => {
    setTasks(null);
    try {

      let my_no_sql_db_name = JSON.parse(await getData('my_no_sql_db_name'));
      let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));

      // LocalDatabase.find({
      //   // selector: { type: 'task' },
      //   selector: {
      //     type: {
      //       $in: ['task', 'facilitator']
      //     }
      //   },
      // })
      let selector: any = {
        type: 'task'
      }

      if (my_no_sql_db_name != no_sql_db_name) {
        let r = await villages_stabilized(null);
        let _villages_stabilized = r?.villages;
        if(_villages_stabilized){
          selector = {
            type: 'task',
            administrative_level_id: {
              $in: _villages_stabilized.map((elt: any) => String(elt.id))
            }
          }
        }
        
      }


      // LocalDatabase.find({
      //   selector: { type: 'task' },
      // })
      getDocumentsByAttributes(selector)
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
