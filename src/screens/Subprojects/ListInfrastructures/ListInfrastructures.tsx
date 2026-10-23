import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Modal, Text, Image, RefreshControl, ScrollView } from 'react-native';
import { HStack, Pressable } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import PaginatedListFooter from '../../../components/PaginatedListFooter';
import { apiCredentials } from '../../../utils/apiCredentials';
import { isCloseToBottom } from '../../../utils/pagination';
import { usePaginatedList } from '../../../utils/usePaginatedList';
import { getData } from '../../../utils/storageManager';
import SubprojectAPI from '../../../services/subprojects/subprojects';
import { Subproject } from 'models/subprojects/Subproject';


function ListInfrastructures({ navigation, route }: {navigation: any; route: any;}) {
  const { t } = useTranslation(['subprojects', 'common']);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
  const [refreshing, setRefreshing] = useState(false);
  
  const { administrativelevel_id, cvd_id, subproject } = route.params;

  const onDismissSnackBar = () => setErrorVisible(false);
  
  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if(!state.isConnected){
        setErrorMessage(t('common:no_network'));
        setErrorVisible(true);
      }else if(!state.isInternetReachable){
        setErrorMessage(t('common:no_internet'));
        setErrorVisible(true);
      }
    });
  }


  // 100 infrastructures par page (plafond du serveur) ; la suite se charge en approchant de la fin de la liste
  const list = usePaginatedList<Subproject>(async (page, pageSize) => {
    await check_network();
    return new SubprojectAPI().get_subprojects(
      {
        ...(await apiCredentials()),
        user: { username: JSON.parse(await getData('username')), email: JSON.parse(await getData('email')) },
      }, JSON.parse(await getData('access')), administrativelevel_id, cvd_id, subproject ? subproject.id : null, page, pageSize);
  });

  
  const onRefresh = () => {
    setRefreshing(true);
    list.refresh();
    setRefreshing(false);
  };

  if (list.loading) {
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
        }
        onScroll={({ nativeEvent }) => { if (isCloseToBottom(nativeEvent)) list.loadMore(); }}
        scrollEventThrottle={250}>
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

          <Content subprojects={list.items} subprojectParent={subproject} onSearch={list.loadAll} onEndReached={list.loadMore} />

          <PaginatedListFooter
            loaded={list.items.length} count={list.count} hasMore={list.hasMore} loadingMore={list.loadingMore}
            error={list.error} onLoadMore={list.loadMore} onRetry={list.retry}
          />

          <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
            {errorMessage}
          </Snackbar>
        </View>
    </ScrollView>
  );
}

export default ListInfrastructures;
