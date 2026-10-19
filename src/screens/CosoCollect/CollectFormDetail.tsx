/** COSOCollect : saisies (démarrées / remplies / envoyées) d'un formulaire chargé. */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useToast } from 'native-base';

import { colors } from '../../utils/colors';
import { PrivateStackParamList } from '../../types/navigation';
import {
  canDeleteLocally, createSubmission, deleteLocalDraft, observeLocalForm, observeSubmissions,
} from '../../services/collect/store';
import { isOnline, syncCollect } from '../../services/collect/sync';
import {
  ClosedBanner, commonStyles as cs, formatDate, normalizeText, SearchInput, SubmissionStatusPill, SyncButton,
  syncReportMessage, useAuthorName, useCollectSyncState, useObservableValue, useOwnerKey,
} from './common';

function CollectFormDetail() {
  const { t } = useTranslation('coso_collect');
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const route: any = useRoute();
  const formServerId: number = route.params?.formServerId;
  const owner = useOwnerKey();
  const author = useAuthorName();
  const formRows = useObservableValue<any[]>(() => (owner ? observeLocalForm(owner, formServerId) : null), [owner, formServerId], []);
  const form = formRows[0] || null;
  const submissions = useObservableValue<any[]>(
    () => (owner ? observeSubmissions(owner, formServerId) : null), [owner, formServerId], [],
  );
  const sync = useCollectSyncState();
  const [query, setQuery] = useState('');
  const [starting, setStarting] = useState(false);

  const runSync = useCallback(async (silent = false) => {
    const report = await syncCollect([formServerId], { ownIndicator: !silent });
    if (!silent || report.closedForms.length) toast.show({ description: syncReportMessage(t, report) });
  }, [formServerId, t, toast]);

  useEffect(() => navigation.addListener('focus', async () => {
    if (await isOnline()) runSync(true);
  }), [navigation, runSync]);

  const items = useMemo(() => {
    const q = normalizeText(query.trim());
    return submissions
      .filter((s: any) => !q || normalizeText(s.title).includes(q))
      .sort((a: any, b: any) => (Date.parse(b.createdAtLocal) || 0) - (Date.parse(a.createdAtLocal) || 0));
  }, [submissions, query]);

  const closedMessage = form?.closeMessage || t('form_closed_default');
  // Formulaire à un seul enregistrement par personne : le sien au lieu d'un nouveau (le plus récent, en
  // écartant d'abord une saisie refusée par le serveur pour cette raison).
  const single = !!form?.singleSubmission;
  const rejected = (s: any) => (s.syncErrorCode === 'single_submission' ? 1 : 0);
  const ownRecord = single && submissions.length ? [...submissions].sort(
    (a: any, b: any) => rejected(a) - rejected(b)
      || (Date.parse(b.createdAtLocal) || 0) - (Date.parse(a.createdAtLocal) || 0),
  )[0] : null;

  const start = async () => {
    if (!form || starting) return;
    if (ownRecord) {
      open(ownRecord);
      return;
    }
    if (!form.isOpen) {
      Alert.alert(t('form_closed_title'), closedMessage);
      return;
    }
    setStarting(true);
    try {
      const record = await createSubmission(owner as string, form, author);
      navigation.navigate('CollectFill', { uuid: record.uuid, formServerId });
    } finally {
      setStarting(false);
    }
  };

  function open(s: any) {
    const canEdit = form && form.isOpen && !s.isLocked;
    if (canEdit) navigation.navigate('CollectFill', { uuid: s.uuid, formServerId });
    else navigation.navigate('CollectSubmissionView', { uuid: s.uuid, formServerId });
  }

  const onLongPress = (s: any) => {
    if (!canDeleteLocally(s)) {
      navigation.navigate('CollectSubmissionView', { uuid: s.uuid, formServerId });
      return;
    }
    Alert.alert(t('delete_draft_title'), t('delete_draft_message', { title: s.title }), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => deleteLocalDraft(s) },
    ]);
  };

  return (
    <View style={cs.container}>
      {form && !form.isOpen ? <ClosedBanner message={closedMessage} /> : null}
      <View style={cs.header}>
        <SearchInput value={query} onChange={setQuery} placeholder={t('search_record')} />
        <View style={[cs.row, { marginTop: 10 }]}>
          <TouchableOpacity
            style={[cs.primaryButton, { flex: 1, marginRight: 8 }, (!form || (!form.isOpen && !ownRecord)) && { backgroundColor: '#b8c2c8' }]}
            onPress={start}
          >
            <Feather name={ownRecord ? 'folder' : 'plus'} size={16} color="white" />
            <Text style={cs.primaryButtonText}>{ownRecord ? t('open_my_record') : t('start_record')}</Text>
          </TouchableOpacity>
          <SyncButton running={sync.running} onPress={() => runSync(false)} label={t('sync')} />
        </View>
        {single ? (
          <View style={[cs.row, { marginTop: 8 }]}>
            <Feather name="user-check" size={14} color={colors.primary} />
            <Text style={[cs.muted, { marginLeft: 6, flex: 1 }]}>{t('single_record_info')}</Text>
          </View>
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(s: any) => s.id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => runSync(false)} colors={[colors.primary]} />}
        contentContainerStyle={items.length ? { paddingBottom: 24 } : { flexGrow: 1 }}
        ListEmptyComponent={(
          <View style={cs.empty}>
            <Feather name="file-text" size={42} color="#c7ced3" />
            <Text style={cs.emptyText}>{query ? t('no_record_matches') : t('no_record_yet')}</Text>
          </View>
        )}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity style={cs.card} onPress={() => open(item)} onLongPress={() => onLongPress(item)}>
            <View style={[cs.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
              <Text style={[cs.title, { flex: 1, marginRight: 8 }]} numberOfLines={2}>{item.title}</Text>
              <Feather
                name={item.dirty ? 'upload-cloud' : 'check'}
                size={16}
                color={item.syncErrorCode ? colors.error : (item.dirty ? colors.inProgress : colors.primary)}
              />
            </View>
            <View style={{ marginTop: 6 }}><SubmissionStatusPill status={item.status} editable={item.editable} /></View>
            <Text style={[cs.muted, { marginTop: 6 }]}>
              {t('recorded_on', { date: formatDate(item.createdAtLocal) })}
              {item.submittedAtLocal ? `  ·  ${t('sent_on', { date: formatDate(item.submittedAtLocal) })}` : ''}
            </Text>
            {item.syncErrorCode ? (
              <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>
                {item.syncErrorCode === 'form_closed' ? (item.syncError || closedMessage)
                  : item.syncErrorCode === 'single_submission' ? t('single_record_rejected')
                    : (item.syncError || t('sync_error_generic'))}
              </Text>
            ) : item.dirty ? (
              <Text style={{ color: '#b26a00', fontSize: 12, marginTop: 4 }}>{t('pending_sync')}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default CollectFormDetail;
