import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, RefreshControl, ScrollView } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import { getData } from '../../../utils/storageManager';
import SubprojectDiagnosticAPI from '../../../services/subprojects/diagnostic';
import { Subproject } from 'models/subprojects/Subproject';


function DiagnosticActivitiesList({ navigation, route }: { navigation: any; route: any; }) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState(t('no_internet'));
  const [connected, setConnected] = useState(true);
  const [subprojects, setSubprojects] = useState(Array<Subproject>());
  const [refreshing, setRefreshing] = useState(false);

  const { filter_type, status, designation } = route.params;

  const onDismissSnackBar = () => setErrorVisible(false);

  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage(t('no_network'));
        setErrorVisible(true);
        setConnected(false);
      } else if (!state.isInternetReachable) {
        setErrorMessage(t('no_internet'));
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }

  const get_diagnostic_list = async () => {
    setLoading(true);
    setConnected(true);
    await check_network();
    if (connected) {
      try {
        await new SubprojectDiagnosticAPI()
          .get_diagnostic_list(
            {
              username: JSON.parse(await getData('username')),
              password: JSON.parse(await getData('password')),
              user: {
                username: JSON.parse(await getData('username')),
                email: JSON.parse(await getData('email'))
              }
            }, JSON.parse(await getData('access')), filter_type, status, designation, 1, 1000)
          .then(async (response: any) => {
            if (response.error) {
              setLoading(false);
              return;
            }
            setSubprojects(response.results as Array<Subproject>);
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
    get_diagnostic_list();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    get_diagnostic_list();
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

        <Content subprojects={subprojects} />

        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
          {errorMessage}
        </Snackbar>
      </View>
    </ScrollView>
  );
}

export default DiagnosticActivitiesList;
