import React, { useState, useEffect } from 'react';
import { View, Modal, Text, Image, RefreshControl, ScrollView } from 'react-native';
import { Heading, HStack, Pressable } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import { getData } from '../../../utils/storageManager';
import SubjectsAPI from '../../../services/supportmaterials/subjects';
import { Subject } from '../../../models/supportmaterials/Subject';
import SearchBar from "../../../components/SearchBar";


function Subjects({ navigation }: { navigation: any; }) {
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  const [connected, setConnected] = useState(true);
  const [subjects, setSubjects] = useState(Array<Subject>());
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);


  const onDismissSnackBar = () => setErrorVisible(false);

  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }


  const get_subjects = async () => {
    setLoading(true);
    setConnected(true);
    await check_network();
    if (connected) {
      try {
        await new SubjectsAPI()
          .get_subjects(page, 1000)
          .then(async (response: any) => {
            if (response.error) {
              setLoading(false);
              return;
            }
            setSubjects(response as Array<Subject>);
            setPage(1);
            setLoading(false);
          })
          .catch(error => {
            setLoading(false);
            console.error(error);
          });

      } catch (e) {
        console.log("Error1 : " + e);
        setErrorVisible(true);
      }

    }
    setLoading(false);

  };

  useEffect(() => {
    get_subjects();
  }, []);


  const onRefresh = () => {
    setRefreshing(true);
    get_subjects();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#24c38b" />
        </View>
        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
          {errorMessage}
        </Snackbar>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={{ flex: 1 }}>


        <Content subjects={subjects} />

        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
          {errorMessage}
        </Snackbar>
      </View>
    </ScrollView>
  );
}

export default Subjects;
