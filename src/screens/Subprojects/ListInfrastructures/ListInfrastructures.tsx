import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Modal, Text, Image, RefreshControl, ScrollView } from 'react-native';
import { HStack, Pressable } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import { getData } from '../../../utils/storageManager';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { Subproject } from 'models/subprojects/Subproject';


function ListInfrastructures({ navigation, route }: {navigation: any; route: any;}) {
  const { t } = useTranslation(['subprojects', 'common']);
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
  const [connected, setConnected] = useState(true);
  const [subprojects, setSubprojects] = useState(Array<Subproject>());
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  
  const { administrativelevel_id, cvd_id, subproject } = route.params;

  const onDismissSnackBar = () => setErrorVisible(false);
  
  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if(!state.isConnected){
        setErrorMessage(t('common:no_network'));
        setErrorVisible(true);
        setConnected(false);
      }else if(!state.isInternetReachable){
        setErrorMessage(t('common:no_internet'));
        setErrorVisible(true);
        setConnected(false);
      }
    });
  }


  const get_subprojects = async () => {
    
    setLoading(true);
    setConnected(true);
    await check_network();
    if(connected){
      try {
        await new SubprojectAPI()
          .get_subprojects(
            { username: JSON.parse(await getData('username')), 
            password: JSON.parse(await getData('password')), 
            user: {
              username: JSON.parse(await getData('username')),
              email: JSON.parse(await getData('email'))
            }
          }, JSON.parse(await getData('access')), administrativelevel_id, cvd_id, subproject ? subproject.id : null,page, 1000)
          .then(async (response: any) => {
            if (response.error) {
              setLoading(false);
              return;
            }
            setSubprojects(response.results as Array<Subproject>);
            setPage(1);
            setLoading(false);

          })
          .catch(error => {
            setLoading(false);
            console.error(error);
          });

      } catch (e) {
        console.log("Error1 : "+e);
        setErrorVisible(true);
      }

    }
    setLoading(false);
    
  };

  useEffect(() => {
    get_subprojects();
  }, []);

  
  const onRefresh = () => {
    setRefreshing(true);
    get_subprojects();
    setRefreshing(false);
  };

  if(loading){
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
          <HStack mb={3} space="5" justifyContent="space-between" 
                    style={{position: 'relative',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 30,
                    zIndex: 2,
                    backgroundColor: 'white',
                    elevation: 8}}
                >
                    <Pressable
                        p={3}
                        flex={1}
                        bg="light"
                        rounded="xl"
                        shadow={3}
                        onPress={() => console.log('pressed')}
                    >
                        <Text>
                            <Text style={{fontSize: 16, fontWeight: 'bold'}}>{t('shared.subproject_label')}</Text>
                            <Text>{ subproject.full_title_of_approved_subproject }</Text>
                        </Text>
                        <Text>
                            <Text style={{fontSize: 16, fontWeight: 'bold'}}>{t('shared.locality_label')}</Text>
                            <Text>
                                {
                                    subproject.location_subproject_realized ?
                                        subproject.location_subproject_realized.name
                                        : subproject.canton ?
                                            subproject.canton.name
                                            : subproject.cvd ?
                                                subproject.cvd.name
                                                : t('common:not_found')
                                }
                            </Text>
                        </Text>


                    </Pressable>
                </HStack>


        <View style={{ flex: 1 }}>

          <Content subprojects={subprojects} subprojectParent={subproject} />

          <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
            {errorMessage}
          </Snackbar>
        </View>
    </ScrollView>
  );
}

export default ListInfrastructures;
