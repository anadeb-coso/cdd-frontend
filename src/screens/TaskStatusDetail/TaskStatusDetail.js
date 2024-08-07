import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, RefreshControl, ScrollView } from "react-native";
import Content from "./containers/Content";
import { ActivityIndicator } from 'react-native-paper';
import { styles } from "./TaskStatusDetail.styles";
// import LocalDatabase from '../../utils/databaseManager';
import { getDocumentsByAttributes } from '../../utils/coucdb_call';
import AuthContext from '../../contexts/auth';
import { handleStorageError } from '../../utils/pouchdb_call';

const TaskStatusDetail = ({ route }) => {
  const { signOut } = useContext(AuthContext);
  const { params } = route;
  const customStyles = styles();
  const [task, setTask] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getTask = () => {
    setTask(null);
    try {
      // LocalDatabase.find({
      //   selector: { type: 'task', _id: params._id },
      // })
      getDocumentsByAttributes({ type: 'task', _id: params._id })
        .then((result: any) => {
          setTask({ ...(result?.docs ?? [])[0], cvd: params.cvd });
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
    getTask();
  }, []);


  const onRefresh = () => {
    setRefreshing(true);
    getTask();
    setRefreshing(false);
  };


  if (task == null)
    return <ActivityIndicator style={{ marginTop: 50 }} size="small" />;

  return (
    <SafeAreaView style={customStyles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Content task={task} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskStatusDetail;
