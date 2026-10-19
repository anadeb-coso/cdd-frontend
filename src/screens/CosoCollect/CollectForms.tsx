/** COSOCollect : formulaires chargés sur l'appareil (du plus récent au plus ancien). */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useToast } from 'native-base';

import { colors } from '../../utils/colors';
import { PrivateStackParamList } from '../../types/navigation';
import { warmUpCollectToken } from '../../services/collect/api';
import { observeAllSubmissions, observeLocalForms, removeLocalForm } from '../../services/collect/store';
import { isOnline, syncCollect } from '../../services/collect/sync';
import {
  commonStyles as cs, formatDate, FormStatusPill, normalizeText, SearchInput, SyncButton, syncReportMessage,
  useCollectSyncState, useObservableValue, useOwnerKey,
} from './common';

function CollectForms() {
  const { t } = useTranslation('coso_collect');
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const owner = useOwnerKey();
  const forms = useObservableValue<any[]>(() => (owner ? observeLocalForms(owner) : null), [owner], []);
  const submissions = useObservableValue<any[]>(() => (owner ? observeAllSubmissions(owner) : null), [owner], []);
  const sync = useCollectSyncState();
  const [query, setQuery] = useState('');

  const runSync = useCallback(async (silent = false) => {
    const report = await syncCollect(undefined, { ownIndicator: !silent });
    if (!silent || report.closedForms.length) toast.show({ description: syncReportMessage(t, report) });
  }, [t, toast]);

  useEffect(() => {
    warmUpCollectToken();
  }, []);

  // À l'ouverture : synchronisation automatique si le téléphone est connecté.
  useEffect(() => navigation.addListener('focus', async () => {
    if (await isOnline()) runSync(true);
  }), [navigation, runSync]);

  const counts = useMemo(() => {
    const out: Record<number, { draft: number; completed: number; submitted: number; pending: number }> = {};
    submissions.forEach((s: any) => {
      const c = out[s.formServerId] || (out[s.formServerId] = { draft: 0, completed: 0, submitted: 0, pending: 0 });
      if (c[s.status as 'draft'] !== undefined) c[s.status as 'draft'] += 1;
      if (s.dirty) c.pending += 1;
    });
    return out;
  }, [submissions]);

  const items = useMemo(() => {
    const q = normalizeText(query.trim());
    return forms
      .filter((f: any) => !q || normalizeText(`${f.title} ${f.description}`).includes(q))
      .sort((a: any, b: any) => {
        const da = Date.parse(a.publishedAt) || a.downloadedAt || 0;
        const db = Date.parse(b.publishedAt) || b.downloadedAt || 0;
        return db - da;
      });
  }, [forms, query]);

  const confirmRemove = (form: any) => {
    Alert.alert(t('remove_form_title'), t('remove_form_message', { title: form.title }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('remove'), style: 'destructive', onPress: async () => {
          const ok = await removeLocalForm(owner as string, form.serverId);
          toast.show({ description: ok ? t('form_removed') : t('form_remove_refused') });
        },
      },
    ]);
  };

  return (
    <View style={cs.container}>
      <View style={cs.header}>
        <SearchInput value={query} onChange={setQuery} placeholder={t('search_form')} />
        <View style={[cs.row, { marginTop: 10 }]}>
          <TouchableOpacity style={[cs.primaryButton, { flex: 1, marginRight: 8 }]} onPress={() => navigation.navigate('CollectAvailableForms')}>
            <Feather name="download" size={16} color="white" />
            <Text style={cs.primaryButtonText}>{t('load_form')}</Text>
          </TouchableOpacity>
          <SyncButton running={sync.running} onPress={() => runSync(false)} label={t('sync')} />
        </View>
      </View>
      <FlatList
        data={items}
        keyExtractor={(f: any) => f.id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => runSync(false)} colors={[colors.primary]} />}
        contentContainerStyle={items.length ? { paddingBottom: 24 } : { flexGrow: 1 }}
        ListEmptyComponent={(
          <View style={cs.empty}>
            <Feather name="clipboard" size={42} color="#c7ced3" />
            <Text style={cs.emptyText}>{query ? t('no_form_matches') : t('no_form_loaded')}</Text>
          </View>
        )}
        renderItem={({ item }: { item: any }) => {
          const c = counts[item.serverId] || { draft: 0, completed: 0, submitted: 0, pending: 0 };
          return (
            <TouchableOpacity
              style={cs.card}
              onPress={() => navigation.navigate('CollectFormDetail', { formServerId: item.serverId, name: item.title })}
              onLongPress={() => confirmRemove(item)}
            >
              <View style={[cs.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                <Text style={[cs.title, { flex: 1, marginRight: 8 }]}>{item.title}</Text>
                <FormStatusPill status={item.status} />
              </View>
              {item.description ? <Text style={cs.subtitle} numberOfLines={2}>{item.description}</Text> : null}
              <View style={[cs.row, { marginTop: 8, flexWrap: 'wrap' }]}>
                <Text style={[cs.muted, { marginRight: 12 }]}>{t('count_draft', { count: c.draft })}</Text>
                <Text style={[cs.muted, { marginRight: 12 }]}>{t('count_completed', { count: c.completed })}</Text>
                <Text style={[cs.muted, { marginRight: 12 }]}>{t('count_submitted', { count: c.submitted })}</Text>
              </View>
              <View style={[cs.row, { marginTop: 6, justifyContent: 'space-between' }]}>
                <Text style={cs.muted}>
                  {item.publishedAt ? t('published_on', { date: formatDate(item.publishedAt, false) }) : ''}
                  {item.lastSyncedAt ? `  ·  ${t('synced_on', { date: formatDate(item.lastSyncedAt) })}` : ''}
                </Text>
                {c.pending ? (
                  <View style={[cs.badge, { backgroundColor: colors.inProgress }]}>
                    <Text style={cs.badgeText}>{c.pending}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

export default CollectForms;
