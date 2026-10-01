import React, { useEffect } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Divider } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import { PrivateStackParamList } from '../../types/navigation';
import { useInternetCreditNotifications } from '../../services/grm/internetCredits';
import { notificationStatus } from './notificationStatus';

/** Notifications de forfait internet CVGP (FC/AC) — ouvert depuis la cloche de l'en-tête. */
function InternetCreditNotifications() {
  const { t } = useTranslation('internet_credits');
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const { items, loading, error, refresh } = useInternetCreditNotifications();

  useEffect(() => navigation.addListener('focus', () => { refresh(); }), [navigation, refresh]);

  if (loading && !items.length) {
    return <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>{t(error)}</Text>
          <Button mode="text" onPress={refresh} labelStyle={{ color: colors.primary }}>{t('retry')}</Button>
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.primary]} />}
        contentContainerStyle={items.length ? undefined : { flexGrow: 1 }}
        ListEmptyComponent={error ? null : (
          <View style={styles.empty}><Text style={styles.muted}>{t('no_notifications')}</Text></View>
        )}
        renderItem={({ item }) => {
          const status = notificationStatus(item, t);
          return (
            <>
              <TouchableOpacity
                style={styles.item}
                onPress={() => navigation.navigate('InternetCreditConfirmation', { beneficiaryId: item.id })}
              >
                <View style={styles.icon}><Feather name="wifi" size={20} color={colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{t('notification_title', { month: item.campaign.month_label })}</Text>
                  <Text style={styles.subtitle}>
                    {t('cvd', { cvd: item.cvd_name })}{item.role !== 'cvgp' && item.member_name ? ` · ${item.member_name}` : ''}
                  </Text>
                  <Text style={[styles.status, { color: status.color }]}>{status.text}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#b0b0b0" />
              </TouchableOpacity>
              <Divider style={{ marginHorizontal: '5%' }} />
            </>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18 },
  icon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(36,195,139,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  title: { fontSize: 14, fontWeight: '600', color: '#373737' },
  subtitle: { fontSize: 12, color: '#707070', marginTop: 2 },
  status: { fontSize: 12, marginTop: 4 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  muted: { color: '#707070', textAlign: 'center' },
  error: { padding: 16, backgroundColor: '#fdecee', alignItems: 'center' },
  errorText: { color: colors.error, textAlign: 'center' },
});

export default InternetCreditNotifications;
