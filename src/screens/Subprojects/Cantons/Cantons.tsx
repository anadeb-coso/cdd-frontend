import React, { useState, useEffect } from 'react';
import { View, Modal, Text, Image, RefreshControl, ScrollView } from 'react-native';
import { Heading, HStack, Pressable } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import { getData } from '../../../utils/storageManager';
import AdministrativelevlsAPI from '../../../services/administrativelevls/administrativelevls';
import { AdministrativeLevel } from 'models/administrativelevels/AdministrativeLevel';
import SearchBar from "../../../components/SearchBar";


function Cantons({ navigation }: { navigation: any; }) {
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState("Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!");
  const [connected, setConnected] = useState(true);
  const [administrativelevels, setAdministrativelevels] = useState(Array<AdministrativeLevel>());
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


  const get_administrativelevls = async () => {
    setLoading(true);
    setConnected(true);
    await check_network();
    if (connected) {
      try {
        await new AdministrativelevlsAPI()
          .get_administrativelevls(
            {
              username: JSON.parse(await getData('username')),
              password: JSON.parse(await getData('password'))
            }, "Canton", null, 1, page, 1000)
          .then(async (response: any) => {
            if (response.error) {
              setLoading(false);
              return;
            }
            // "count": 3,
            // "next": null,
            // "previous": null,
            // results
            setAdministrativelevels(response.results as Array<AdministrativeLevel>);
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
    get_administrativelevls();
  }, []);


  const onRefresh = () => {
    setRefreshing(true);
    get_administrativelevls();
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





        <View>
          <HStack mb={3} ml={5} mr={5} space="5" justifyContent="space-between">
            <Pressable
              p={2}
              h="10"
              flex={1}
              style={{  borderColor: '#34c134', borderWidth: 3, backgroundColor: 'white' }} 
              color={'#34c134'}
              rounded="xl"
              shadow={3}
              onPress={() => navigation.navigate('ListSubprojects', {
                administrativelevel_id: null,
                cvd_id: null,
                subproject: null,
                name: `Sous-projets`
              })}
            >
              <Text
                fontSize={12}
                // fontFamily="body"
                fontWeight={700}
                color="#34c134"
                marginY={'auto'}
              >
                Voir les sous-projets
              </Text>
            </Pressable>
          </HStack>
        </View>


        <Content administrativelevels={administrativelevels} />

        <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
          {errorMessage}
        </Snackbar>
      </View>
    </ScrollView>
  );
}

export default Cantons;
