import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native';
import { Heading, HStack, Pressable, ScrollView, Text, View, Image } from 'native-base';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import PaginatedListFooter from '../../../components/PaginatedListFooter';
import { apiCredentials } from '../../../utils/apiCredentials';
import { isCloseToBottom } from '../../../utils/pagination';
import { usePaginatedList } from '../../../utils/usePaginatedList';
import AdministrativelevlsAPI from '../../../services/administrativelevls/administrativelevls';
import { AdministrativeLevel } from 'models/administrativelevels/AdministrativeLevel';


function Villages({ navigation, route }: {navigation: any; route: any;}) {
  const { t } = useTranslation(['subprojects', 'common']);
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState(t('common:no_internet'));
  const [refreshing, setRefreshing] = useState(false);

  const { parent_id, parent_name } = route.params;

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


  // 100 villages par page (plafond du serveur) ; la suite se charge en approchant de la fin de la liste
  const list = usePaginatedList<AdministrativeLevel>(async (page, pageSize) => {
    await check_network();
    return new AdministrativelevlsAPI().get_administrativelevels(await apiCredentials(), "Village", parent_id, page, pageSize);
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
                onPress={() =>  navigation.navigate('CVD', {
                  parent_id: parent_id,
                  name: parent_name.length > 18 ? null : t('villages.cvd_of', { name: parent_name }),
                  parent_name: parent_name
                })}
              >
                <Text
                  fontSize={12}
                  // fontFamily="body"
                  fontWeight={700}
                  color="#34c134"
                  marginY={'auto'}
                >
                  {t('villages.view_cvd_only')}
                </Text>
              </Pressable>
            </HStack>
          </View>
          <View>
            <HStack mb={3} ml={5} mr={5} space="5" justifyContent="space-between">
              <Pressable
                p={3}
                h="16"
                flex={10}
                style={{  borderColor: '#34c134', borderWidth: 3, backgroundColor: 'white' }}
                color={'#34c134'}
                rounded="xl"
                shadow={3}
                onPress={() =>  navigation.navigate('ListSubprojects', {
                  administrativelevel_id: parent_id,
                  cvd_id: null,
                  name: parent_name.length > 18 ? null : t('cvd.subprojects_of', { name: parent_name })
                })}
              >
                <Text
                  fontSize={12}
                  // fontFamily="body"
                  fontWeight={700}
                  color="#34c134"
                  marginY={'auto'}
                >
                  {t('cvd.view_subprojects_of', { name: parent_name })}
                </Text>
              </Pressable>
              <Pressable
                h="16"
                flex={3}
                rounded="xl"
                shadow={3}
                onPress={() => console.log('pressed')}
              >
                <Image
                  alt='Image'
                  resizeMode="stretch"
                  style={{ width: 65, height: 65, flex: 1, alignItems: 'center', justifyContent: 'center' }}
                  source={require('../../../../assets/illustrations/money.png')}
                />
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

export default Villages;
