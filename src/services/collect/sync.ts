/**
 * Synchronisation COSOCollect : saisies locales (WatermelonDB) <-> Web DCC.
 *
 * Pour un formulaire :
 *   1. envoi des photos / fichiers pas encore reçus par le serveur (valeurs avec `local_uri` et sans
 *      `attachment_id`) ;
 *   2. envoi des saisies modifiées localement (`dirty`) ; le serveur répond saisie par saisie :
 *      acceptée (sa copie fait foi : titre combiné, verrouillage), refusée parce que le formulaire est
 *      clôturé (`form_closed` : la saisie reste sur l'appareil, le message de clôture est affiché),
 *      ou verrouillée (`locked` : déjà envoyée, la copie serveur remplace la locale) ;
 *   3. récupération des saisies du compte faites ailleurs (web, autre appareil) ou rouvertes par un
 *      administrateur ;
 *   4. rechargement de la définition si le formulaire a changé de version.
 *
 * Déclencheurs — mêmes règles que l'app mobile du MGP (grm-frontend : database/watermelonSyncManager.js) :
 *   - toutes les 5 minutes tant que l'application est au premier plan, toutes les heures en
 *     arrière-plan (période réajustée à chaque changement d'état de l'application) ;
 *   - au retour de la connexion et au retour au premier plan ;
 *   - à chaque enregistrement d'une saisie (« pendant la saisie ») et à la demande (bouton
 *     « Synchroniser »).
 * Une fine barre de progression (CollectSyncProgressBar, montée à la racine de l'app) s'affiche
 * pendant les synchronisations automatiques ; la synchronisation manuelle a son propre indicateur.
 * Le serveur est d'abord interrogé sur `/health/` : s'il ne répond pas, rien n'est tenté.
 */
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import {
  CollectAuthError, currentOwnerKey, fetchCollectForm, fetchMySubmissions, isServerHealthy, pushSubmissions,
  uploadCollectFile,
} from './api';
import {
  acknowledgeSubmission, applyFormSummary, applyServerSubmission, getDirtySubmissions, getLocalForm, getLocalForms,
  markFormSynced, markSyncError, saveFormDefinition, updateSubmissionData,
} from './store';

export type SyncReport = {
  ok: boolean;
  sent: number;
  received: number;
  rejected: number;
  closedForms: { id: number; title: string; message: string }[];
  error?: 'network_required' | 'login_failed' | 'server_error' | 'server_unavailable';
};

export type SyncOptions = {
  /** L'appelant affiche déjà son propre indicateur (bouton « Synchroniser ») : pas de barre globale. */
  ownIndicator?: boolean;
};

type SyncState = { running: boolean; showProgress: boolean; formIds: number[]; lastReport: SyncReport | null };
let syncState: SyncState = { running: false, showProgress: false, formIds: [], lastReport: null };
const listeners = new Set<(s: SyncState) => void>();

function setSyncState(patch: Partial<SyncState>) {
  syncState = { ...syncState, ...patch };
  listeners.forEach((l) => l(syncState));
}

export function subscribeCollectSync(listener: (s: SyncState) => void): () => void {
  listeners.add(listener);
  listener(syncState);
  return () => { listeners.delete(listener); };
}

export async function isOnline(): Promise<boolean> {
  const net = await NetInfo.fetch();
  return !!net.isConnected && net.isInternetReachable !== false;
}

/** Valeurs photo/fichier (objets avec `local_uri`) à envoyer, avec leur chemin "$<page>.<chemin>". */
function pendingMedia(data: any[]): { path: string; value: any }[] {
  const out: { path: string; value: any }[] = [];
  const walk = (value: any, path: string) => {
    if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}.${i}`));
    else if (value && typeof value === 'object') {
      if (value.local_uri && !value.attachment_id) out.push({ path, value });
      else Object.keys(value).forEach((k) => walk(value[k], `${path}.${k}`));
    }
  };
  (data || []).forEach((page, i) => walk(page, `$${i}`));
  return out;
}

function setAtPath(data: any[], path: string, value: any): any[] {
  const copy = JSON.parse(JSON.stringify(data || []));
  const parts = path.slice(1).split('.');
  let cur: any = copy;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cur = cur[Array.isArray(cur) ? Number(parts[i]) : parts[i]];
    if (cur === undefined || cur === null) return copy;
  }
  cur[parts[parts.length - 1]] = value;
  return copy;
}

async function uploadPendingMedia(formServerId: number, record: any): Promise<void> {
  let data = record.data;
  const pending = pendingMedia(data);
  for (const { path, value } of pending) {
    const attachment = await uploadCollectFile({
      formId: formServerId, submissionUuid: record.uuid, fieldPath: path,
      uri: value.local_uri, name: value.name || 'fichier', mime: value.mime || 'application/octet-stream',
    });
    data = setAtPath(data, path, { ...value, attachment_id: attachment.attachment_id, size: attachment.size });
    await updateSubmissionData(record, data);
  }
}

function toPayload(record: any) {
  return {
    uuid: record.uuid,
    status: record.status,
    data: record.data,
    created_at: record.createdAtLocal,
    updated_at: record.updatedAt ? new Date(record.updatedAt).toISOString() : null,
    submitted_at: record.submittedAtLocal || null,
    form_version: record.formVersion,
  };
}

async function syncOneForm(owner: string, formServerId: number, report: SyncReport): Promise<void> {
  const form = await getLocalForm(owner, formServerId);
  if (!form) return;

  // 1-2. Envoi des saisies modifiées (photos d'abord)
  const dirty = await getDirtySubmissions(owner, formServerId);
  const ready: any[] = [];
  for (const record of dirty) {
    try {
      await uploadPendingMedia(formServerId, record);
      ready.push(record);
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      // le serveur expliquera au push
      if (code === 'form_closed' || code === 'locked' || code === 'single_submission') ready.push(record);
      else if (status) await markSyncError(record, 'upload_failed', err?.response?.data?.message || 'upload');
      else throw err; // réseau coupé : on arrête là, tout repartira plus tard
    }
  }
  for (let i = 0; i < ready.length; i += 50) {
    const batch = ready.slice(i, i + 50);
    const stamps = new Map(batch.map((r) => [r.uuid, r.updatedAt ? new Date(r.updatedAt).getTime() : 0]));
    const response = await pushSubmissions(formServerId, batch.map(toPayload));
    if (response.form) await applyFormSummary(owner, response.form);
    for (const result of response.results || []) {
      const record = batch.find((r) => r.uuid === result.uuid);
      if (!record) continue;
      if (result.ok && result.submission) {
        await acknowledgeSubmission(record, result.submission, stamps.get(record.uuid) || 0);
        report.sent += 1;
      } else if (result.code === 'locked' && result.submission) {
        await applyServerSubmission(owner, result.submission, true);
        report.rejected += 1;
      } else {
        await markSyncError(record, result.code || 'error', result.message || '');
        report.rejected += 1;
        if (result.code === 'form_closed' && !report.closedForms.some((f) => f.id === formServerId)) {
          report.closedForms.push({ id: formServerId, title: form.title, message: result.message || '' });
        }
      }
    }
  }

  // 3. Saisies faites ailleurs / rouvertes par un administrateur
  const since = form.lastSyncedAt ? new Date(form.lastSyncedAt - 60000).toISOString() : null;
  const pulled = await fetchMySubmissions(formServerId, since);
  for (const server of pulled.submissions || []) {
    await applyServerSubmission(owner, server);
    report.received += 1;
  }
  if (pulled.form) await applyFormSummary(owner, pulled.form);

  // 4. Nouvelle version du formulaire
  const refreshed = await getLocalForm(owner, formServerId);
  if (pulled.form && refreshed && pulled.form.version > refreshed.version) {
    await saveFormDefinition(owner, await fetchCollectForm(formServerId));
  }
  const serverTime = Date.parse(pulled.server_time);
  await markFormSynced(owner, formServerId, Number.isFinite(serverTime) ? serverTime : Date.now());
}

let inFlight: Promise<SyncReport> | null = null;

/** Synchronise les formulaires donnés (tous les formulaires chargés si `formIds` est omis).
 *
 * Verrou par promesse partagée : un appel qui arrive pendant une synchronisation en cours en reçoit
 * le résultat au lieu d'en lancer une seconde. Ne rejette jamais (sûr en « fire-and-forget »). */
export function syncCollect(formIds?: number[], options?: SyncOptions): Promise<SyncReport> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const report: SyncReport = { ok: true, sent: 0, received: 0, rejected: 0, closedForms: [] };
    const owner = await currentOwnerKey();
    if (!owner) return report;
    const ids = formIds || (await getLocalForms(owner)).map((f: any) => f.serverId);
    if (!ids.length) return report; // aucun formulaire chargé : rien à synchroniser
    if (!(await isOnline())) {
      report.ok = false;
      report.error = 'network_required';
      return report;
    }
    setSyncState({ running: true, showProgress: !options?.ownIndicator, formIds: ids });
    if (!(await isServerHealthy())) {
      if (__DEV__) console.log('[COSOCollect] serveur indisponible (/health/), synchronisation annulée');
      report.ok = false;
      report.error = 'server_unavailable';
      return report;
    }
    try {
      for (const id of ids) await syncOneForm(owner, id, report);
    } catch (err: any) {
      report.ok = false;
      report.error = err instanceof CollectAuthError ? 'login_failed' : err?.response ? 'server_error' : 'network_required';
    }
    return report;
  })().catch((): SyncReport => ({
    ok: false, sent: 0, received: 0, rejected: 0, closedForms: [], error: 'server_error',
  })).then((report) => {
    setSyncState({ running: false, showProgress: false, formIds: [], lastReport: report });
    return report;
  }).finally(() => { inFlight = null; });
  return inFlight;
}

const pendingTimers: Record<number, ReturnType<typeof setTimeout>> = {};

/** Synchronisation « pendant la saisie » : si le téléphone est connecté, envoie les changements du
 * formulaire peu après un enregistrement local (regroupe les enregistrements rapprochés). */
export function requestCollectSync(formServerId: number, delayMs = 1500): void {
  if (pendingTimers[formServerId]) clearTimeout(pendingTimers[formServerId]);
  pendingTimers[formServerId] = setTimeout(async () => {
    delete pendingTimers[formServerId];
    if (await isOnline()) {
      if (inFlight) await inFlight.catch(() => undefined);
      syncCollect([formServerId]).catch(() => undefined);
    }
  }, delayMs);
}

// ------------------------------------------------------------------ synchronisation périodique
// Mêmes périodes que le MGP mobile (grm-frontend : FOREGROUND/BACKGROUND_SYNC_INTERVAL_MS).
export const FOREGROUND_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes au premier plan
export const BACKGROUND_SYNC_INTERVAL_MS = 60 * 60 * 1000; // 1 heure en arrière-plan

let isStarted = false;
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let netInfoUnsubscribe: (() => void) | null = null;
let appStateSubscription: { remove: () => void } | null = null;
let lastAppState: AppStateStatus = AppState.currentState;
// `true` au départ : startCollectSync() lance déjà une synchronisation, le premier événement
// NetInfo « connecté » ne doit pas en relancer une.
let wasConnected = true;

function runPeriodicSync() {
  syncCollect().catch(() => undefined);
}

/** (Re)démarre l'intervalle avec la période de l'état courant (premier plan / arrière-plan). */
function restartSyncInterval() {
  if (intervalHandle) clearInterval(intervalHandle);
  const periodMs = lastAppState === 'active' ? FOREGROUND_SYNC_INTERVAL_MS : BACKGROUND_SYNC_INTERVAL_MS;
  intervalHandle = setInterval(runPeriodicSync, periodMs);
  if (__DEV__) console.log(`[COSOCollect] synchronisation périodique toutes les ${periodMs / 60000} min (${lastAppState})`);
}

/** Démarre la synchronisation automatique (appelé à la connexion et à la restauration de session,
 * cf. contexts/auth.tsx). Idempotent : un second appel ne fait rien. */
export function startCollectSync(): void {
  if (isStarted) return;
  isStarted = true;

  runPeriodicSync();

  netInfoUnsubscribe = NetInfo.addEventListener((net) => {
    const connected = !!net.isConnected && net.isInternetReachable !== false;
    // Seulement sur une vraie transition déconnecté -> connecté (NetInfo peut émettre plusieurs
    // événements « connecté » d'affilée pendant que la connexion se stabilise).
    if (connected && !wasConnected) {
      if (__DEV__) console.log('[COSOCollect] réseau de retour, relance de la synchronisation');
      runPeriodicSync();
    }
    wasConnected = connected;
  });

  lastAppState = AppState.currentState;
  appStateSubscription = AppState.addEventListener('change', (next) => {
    const wasActive = lastAppState === 'active';
    const isActive = next === 'active';
    lastAppState = next;
    if (isActive === wasActive) return; // ex. 'inactive' -> 'background' : rien à changer
    restartSyncInterval();
    if (isActive) {
      if (__DEV__) console.log('[COSOCollect] application au premier plan, relance de la synchronisation');
      runPeriodicSync();
    }
  });

  restartSyncInterval();
}

/** Arrête la synchronisation automatique (déconnexion). */
export function stopCollectSync(): void {
  isStarted = false;
  if (netInfoUnsubscribe) netInfoUnsubscribe();
  netInfoUnsubscribe = null;
  if (appStateSubscription) appStateSubscription.remove();
  appStateSubscription = null;
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
  wasConnected = true;
}

/** « Charger un formulaire » : enregistre sa définition sur l'appareil puis récupère les saisies
 * déjà faites par ce compte (sur le web ou un autre appareil). */
export async function loadCollectForm(formServerId: number): Promise<void> {
  const owner = await currentOwnerKey();
  await saveFormDefinition(owner, await fetchCollectForm(formServerId));
  if (inFlight) await inFlight.catch(() => undefined); // une synchro en cours ne couvre pas ce formulaire
  await syncCollect([formServerId]);
}
