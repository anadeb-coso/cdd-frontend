import React, { useState, useEffect } from 'react';
import { View, Modal, Text, Image, RefreshControl, ScrollView } from 'react-native';
import { Heading, HStack, Pressable } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import { SupportingMaterial } from '../../../models/supportmaterials/SupportingMaterial';
import SearchBar from "../../../components/SearchBar";


function SupportMaterials({ navigation, route }: { navigation: any; route: any; }) {
  const { lesson, subject } = route.params;

  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  const [connected, setConnected] = useState(true);
  const [supportingmaterials, setSupportingmaterials] = useState(lesson.supportingmaterials as Array<SupportingMaterial>);
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



  useEffect(() => {
    check_network();
  }, [check_network]);


  const onRefresh = () => {
    setRefreshing(true);
    
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


        <Content supportingmaterials={supportingmaterials} lesson={lesson} subject={subject} check_network={check_network} />

        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
          {errorMessage}
        </Snackbar>
      </View>
    </ScrollView>
  );
}

export default SupportMaterials;
