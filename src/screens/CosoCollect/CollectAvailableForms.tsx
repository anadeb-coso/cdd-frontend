/** COSOCollect : formulaires publiés sur le serveur et pas encore chargés sur l'appareil. */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useToast } from 'native-base';

import { colors } from '../../utils/colors';
import { CollectAuthError, CollectFormSummary, fetchCollectForms } from '../../services/collect/api';
import { observeLocalForms } from '../../services/collect/store';
import { loadCollectForm } from '../../services/collect/sync';
import {
  commonStyles as cs, formatDate, FormStatusPill, normalizeText, SearchInput, useObservableValue, useOwnerKey,
} from './common';

function CollectAvailableForms() {
  const { t } = useTranslation('coso_collect');
  const toast = useToast();
  const owner = useOwnerKey();
  const localForms = useObservableValue<any[]>(() => (owner ? observeLocalForms(owner) : null), [owner], []);
  const [remote, setRemote] = useState<CollectFormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRemote(await fetchCollectForms());
      setError(null);
    } catch (err: any) {
      setError(err instanceof CollectAuthError ? 'sync_login_failed' : err?.response ? 'sync_server_error' : 'network_required_to_load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const items = useMemo(() => {
    const loaded = new Set(localForms.map((f: any) => f.serverId));
    const q = normalizeText(query.trim());
    return remote
      .filter((f) => !loaded.has(f.id))
      .filter((f) => !q || normalizeText(`${f.title} ${f.description}`).includes(q));
  }, [remote, localForms, query]);

  const load = async (form: CollectFormSummary) => {
    setLoadingId(form.id);
    try {
      await loadCollectForm(form.id);
      toast.show({ description: t('form_loaded', { title: form.title }) });
    } catch (err) {
      toast.show({ description: t('form_load_failed') });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <View style={cs.container}>
      <View style={cs.header}>
        <SearchInput value={query} onChange={setQuery} placeholder={t('search_form')} />
      </View>
      {error ? (
        <View style={{ padding: 14, backgroundColor: '#fdecee', marginHorizontal: 16, borderRadius: 10 }}>
          <Text style={{ color: colors.error, textAlign: 'center' }}>{t(error)}</Text>
        </View>
      ) : null}
      <FlatList
        data={items}
        keyExtractor={(f) => String(f.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.primary]} />}
        contentContainerStyle={items.length ? { paddingBottom: 24 } : { flexGrow: 1 }}
        ListEmptyComponent={loading ? null : (
          <View style={cs.empty}>
            <Feather name="inbox" size={42} color="#c7ced3" />
            <Text style={cs.emptyText}>{error ? '' : (query ? t('no_form_matches') : t('no_form_to_load'))}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={cs.card}>
            <View style={[cs.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
              <Text style={[cs.title, { flex: 1, marginRight: 8 }]}>{item.title}</Text>
              <FormStatusPill status={item.status} />
            </View>
            {item.description ? <Text style={cs.subtitle} numberOfLines={3}>{item.description}</Text> : null}
            <View style={[cs.row, { marginTop: 10, justifyContent: 'space-between' }]}>
              <Text style={cs.muted}>{item.published_at ? t('published_on', { date: formatDate(item.published_at, false) }) : ''}</Text>
              <TouchableOpacity style={[cs.primaryButton, { paddingVertical: 8 }]} onPress={() => load(item)} disabled={loadingId !== null}>
                {loadingId === item.id ? <ActivityIndicator size="small" color="white" /> : <Feather name="download" size={15} color="white" />}
                <Text style={cs.primaryButtonText}>{t('load')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

export default CollectAvailableForms;
