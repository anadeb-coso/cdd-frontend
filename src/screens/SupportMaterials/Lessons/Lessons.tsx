import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Modal, Text, Image, RefreshControl, ScrollView } from 'react-native';
import { Heading, HStack, Pressable } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import { Lesson } from '../../../models/supportmaterials/Lesson';
import SearchBar from "../../../components/SearchBar";


function Lessons({ navigation, route }: { navigation: any; route: any; }) {
  const { subject } = route.params;

  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState(t('no_internet'));
  const [connected, setConnected] = useState(true);
  const [lessons, setLessons] = useState(subject.lessons as Array<Lesson>);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);


  const onDismissSnackBar = () => setErrorVisible(false);

  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage(t('no_network'));
        setErrorVisible(true);
        setConnected(false);
      }else if(!state.isInternetReachable){
        setErrorMessage(t('no_internet'));
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }



  useEffect(() => {
    
  }, []);


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


        <Content lessons={lessons} subject={subject} />

        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
          {errorMessage}
        </Snackbar>
      </View>
    </ScrollView>
  );
}

export default Lessons;
