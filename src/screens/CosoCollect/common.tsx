/** Éléments partagés par les écrans COSOCollect. */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { colors } from '../../utils/colors';
import { getData } from '../../utils/storageManager';
import { currentOwnerKey, subscribeOwnerKey } from '../../services/collect/api';
import { subscribeCollectSync, SyncReport } from '../../services/collect/sync';

/** Valeur courante d'un observable WatermelonDB (requête), ré-abonné quand `deps` change. */
export function useObservableValue<T>(factory: () => any | null, deps: any[], initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    const observable = factory();
    if (!observable) return undefined;
    const subscription = observable.subscribe((v: T) => setValue(v));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

export function useOwnerKey(): string | null {
  const [owner, setOwner] = useState<string | null>(null);
  useEffect(() => {
    currentOwnerKey().then(setOwner);
    // compte identifié par le serveur après l'ouverture de l'écran : on relit sous sa clé stable
    return subscribeOwnerKey(setOwner);
  }, []);
  return owner;
}

async function readCredential(key: string): Promise<string> {
  const value = await getData(key);
  if (typeof value !== 'string') return value ? String(value) : '';
  try {
    const parsed = JSON.parse(value);
    return parsed ? String(parsed) : '';
  } catch (err) {
    return value;
  }
}

/** Nom affiché de l'auteur (métadonnée « auteur » du titre combiné). */
export function useAuthorName(): string {
  const [name, setName] = useState('');
  useEffect(() => {
    (async () => {
      const full = await readCredential('name');
      if (full) { setName(full); return; }
      const first = await readCredential('first_name');
      const last = await readCredential('last_name');
      setName(`${first} ${last}`.trim() || (await readCredential('username')));
    })();
  }, []);
  return name;
}

export function useCollectSyncState() {
  const [state, setState] = useState<{ running: boolean; showProgress: boolean; formIds: number[]; lastReport: SyncReport | null }>({
    running: false, showProgress: false, formIds: [], lastReport: null,
  });
  useEffect(() => subscribeCollectSync(setState), []);
  return state;
}

export function normalizeText(s: any): string {
  let text = String(s || '');
  if (text.normalize) text = text.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return text.toLowerCase();
}

export function formatDate(value: any, withTime = true): string {
  if (!value) return '';
  const m = moment(value);
  return m.isValid() ? m.format(withTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY') : '';
}

/** Message de fin de synchronisation (toast). */
export function syncReportMessage(t: (k: string, o?: any) => string, report: SyncReport): string {
  if (report.error === 'network_required') return t('sync_offline');
  if (report.error === 'login_failed') return t('sync_login_failed');
  if (report.error === 'server_unavailable') return t('sync_server_unavailable');
  if (report.error) return t('sync_server_error');
  if (report.closedForms.length) {
    const f = report.closedForms[0];
    return f.message || t('form_closed_default');
  }
  return t('sync_done', { sent: report.sent, received: report.received });
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <View style={styles.search}>
      <Feather name="search" size={18} color="#8a969e" />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#a0aab1"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="x" size={18} color="#8a969e" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const SUBMISSION_COLORS: Record<string, { bg: string; fg: string; icon: any }> = {
  draft: { bg: '#fff4e5', fg: '#b26a00', icon: 'clock' },
  completed: { bg: '#e7f1ff', fg: '#1c64d6', icon: 'check-square' },
  submitted: { bg: '#e3f8ef', fg: '#1e8a5f', icon: 'check-circle' },
};

export function SubmissionStatusPill({ status, editable }: { status: string; editable?: boolean }) {
  const { t } = useTranslation('coso_collect');
  const c = SUBMISSION_COLORS[status] || SUBMISSION_COLORS.draft;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      <View style={[styles.pill, { backgroundColor: c.bg }]}>
        <Feather name={c.icon} size={11} color={c.fg} />
        <Text style={[styles.pillText, { color: c.fg }]}>{t(`status_${status}`)}</Text>
      </View>
      {editable ? (
        <View style={[styles.pill, { backgroundColor: '#f3e8ff', marginLeft: 4 }]}>
          <Feather name="unlock" size={11} color="#7b3fbf" />
          <Text style={[styles.pillText, { color: '#7b3fbf' }]}>{t('status_reopened')}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function FormStatusPill({ status }: { status: string }) {
  const { t } = useTranslation('coso_collect');
  const closed = status === 'closed';
  return (
    <View style={[styles.pill, { backgroundColor: closed ? '#fdecee' : '#e3f8ef' }]}>
      <Feather name={closed ? 'lock' : 'radio'} size={11} color={closed ? '#c0392b' : '#1e8a5f'} />
      <Text style={[styles.pillText, { color: closed ? '#c0392b' : '#1e8a5f' }]}>{t(closed ? 'form_closed' : 'form_open')}</Text>
    </View>
  );
}

export function SyncButton({ running, onPress, label }: { running: boolean; onPress: () => void; label: string }) {
  return (
    <TouchableOpacity style={[styles.syncButton, running && { opacity: 0.7 }]} onPress={onPress} disabled={running}>
      {running ? <ActivityIndicator size="small" color={colors.primary} /> : <Feather name="refresh-cw" size={16} color={colors.primary} />}
      <Text style={styles.syncButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ClosedBanner({ message }: { message: string }) {
  return (
    <View style={styles.closedBanner}>
      <Feather name="lock" size={16} color="#c0392b" />
      <Text style={styles.closedBannerText}>{message}</Text>
    </View>
  );
}

export const commonStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: '#373737' },
  subtitle: { fontSize: 12, color: '#707070', marginTop: 2 },
  muted: { color: '#8a969e', fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyText: { color: '#707070', textAlign: 'center', marginTop: 10 },
  card: {
    marginHorizontal: 16, marginVertical: 6, padding: 14, borderRadius: 12, backgroundColor: 'white',
    borderWidth: 1, borderColor: '#eef1f3',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary,
    paddingVertical: 11, paddingHorizontal: 14, borderRadius: 10,
  },
  primaryButtonText: { color: 'white', fontWeight: '700', marginLeft: 6 },
  outlineButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderColor: colors.primary, borderWidth: 1,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: 'white',
  },
  outlineButtonText: { color: colors.primary, fontWeight: '700', marginLeft: 6 },
  badge: {
    minWidth: 20, paddingHorizontal: 6, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
});

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e3e7ea', borderRadius: 10,
    paddingHorizontal: 10, backgroundColor: '#f8f9fa', height: 42,
  },
  searchInput: { flex: 1, marginHorizontal: 8, fontSize: 14, color: '#373737', paddingVertical: 0 },
  pill: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  syncButton: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 12, height: 42, backgroundColor: 'white',
  },
  syncButtonText: { color: colors.primary, fontWeight: '700', marginLeft: 6 },
  closedBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdecee', borderRadius: 10, padding: 10,
    marginHorizontal: 16, marginTop: 8,
  },
  closedBannerText: { color: '#c0392b', marginLeft: 8, flex: 1, fontSize: 13 },
});
