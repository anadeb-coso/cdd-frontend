import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, RefreshControl, ScrollView } from 'react-native';
import { HStack, Pressable } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import AdministrativelevlsAPI from '../../../services/administrativelevls/administrativelevls';
import { AdministrativeLevel } from 'models/administrativelevels/AdministrativeLevel';
import PaginatedListFooter from '../../../components/PaginatedListFooter';
import { apiCredentials } from '../../../utils/apiCredentials';
import { isCloseToBottom } from '../../../utils/pagination';
import { usePaginatedList } from '../../../utils/usePaginatedList';


function Cantons({ navigation }: { navigation: any; }) {
  const { t } = useTranslation(['subprojects', 'common']);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
  const [refreshing, setRefreshing] = useState(false);


  const onDismissSnackBar = () => setErrorVisible(false);

  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage(t('common:no_network'));
        setErrorVisible(true);
      }else if(!state.isInternetReachable){
        setErrorMessage(t('common:no_internet'));
        setErrorVisible(true);
      }
    });
  }

  // 100 cantons par page (plafond du serveur) ; la suite se charge en approchant de la fin de la liste
  const list = usePaginatedList<AdministrativeLevel>(async (page, pageSize) => {
    await check_network();
    return new AdministrativelevlsAPI().get_administrativelevels(await apiCredentials(), "Canton", null, page, pageSize);
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
                name: t('shared.subprojects_title')
              })}
            >
              <Text>
                {t('cantons.view_subprojects')}
              </Text>
            </Pressable>
          </HStack>
        </View>


        <Content administrativelevels={list.items} onSearch={list.loadAll} onEndReached={list.loadMore} />

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

export default Cantons;
