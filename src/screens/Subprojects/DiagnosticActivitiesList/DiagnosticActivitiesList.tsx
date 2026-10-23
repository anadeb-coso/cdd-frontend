import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, RefreshControl, ScrollView } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Content from './components/Content';
import PaginatedListFooter from '../../../components/PaginatedListFooter';
import { apiCredentials } from '../../../utils/apiCredentials';
import { isCloseToBottom } from '../../../utils/pagination';
import { usePaginatedList } from '../../../utils/usePaginatedList';
import { getData } from '../../../utils/storageManager';
import SubprojectDiagnosticAPI from '../../../services/subprojects/diagnostic';
import { Subproject } from 'models/subprojects/Subproject';


function DiagnosticActivitiesList({ navigation, route }: { navigation: any; route: any; }) {
  const { t } = useTranslation('common');
  const [errorVisible, setErrorVisible] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState(t('no_internet'));
  const [refreshing, setRefreshing] = useState(false);

  const { filter_type, status, designation } = route.params;

  const onDismissSnackBar = () => setErrorVisible(false);

  const check_network = async () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        setErrorMessage(t('no_network'));
        setErrorVisible(true);
      } else if (!state.isInternetReachable) {
        setErrorMessage(t('no_internet'));
        setErrorVisible(true);
      }
    });
  }

  // 100 activités par page (plafond du serveur) ; la suite se charge en approchant de la fin de la liste
  const list = usePaginatedList<Subproject>(async (page, pageSize) => {
    await check_network();
    return new SubprojectDiagnosticAPI().get_diagnostic_list(
      {
        ...(await apiCredentials()),
        user: { username: JSON.parse(await getData('username')), email: JSON.parse(await getData('email')) },
      }, JSON.parse(await getData('access')), filter_type, status, designation, page, pageSize);
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

        <Content subprojects={list.items} onSearch={list.loadAll} onEndReached={list.loadMore} />

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

export default DiagnosticActivitiesList;
