import React, { useState, useEffect } from 'react';
import { View, RefreshControl, ScrollView } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import { getData } from '../../../utils/storageManager';
import SubprojectDiagnosticAPI from '../../../services/subprojects/diagnostic';


function Diagnostics({ navigation, route }: { navigation: any; route: any; }) {
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  const [connected, setConnected] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onDismissSnackBar = () => setErrorVisible(false);

  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage("Vous n'êtes pas connecté à aucun réseau. Veuillez activer votre donnée mobile ou connecter vous à un wifi.");
        setErrorVisible(true);
        setConnected(false);
      } else if (!state.isInternetReachable) {
        setErrorMessage("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }

  const get_diagnostic_summary = async () => {
    setLoading(true);
    setConnected(true);
    await check_network();
    if (connected) {
      try {
        await new SubprojectDiagnosticAPI()
          .get_diagnostic_summary(
            {
              username: JSON.parse(await getData('username')),
              password: JSON.parse(await getData('password')),
              user: {
                username: JSON.parse(await getData('username')),
                email: JSON.parse(await getData('email'))
              }
            }, JSON.parse(await getData('access')))
          .then(async (response: any) => {
            if (response.error) {
              setLoading(false);
              return;
            }
            setSummary(response);
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
    get_diagnostic_summary();
    const unsubscribe = navigation.addListener('focus', () => {
      get_diagnostic_summary();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    get_diagnostic_summary();
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

        <Content summary={summary} />

        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
          {errorMessage}
        </Snackbar>
      </View>
    </ScrollView>
  );
}

export default Diagnostics;
