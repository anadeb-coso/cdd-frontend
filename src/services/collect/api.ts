/**
 * API COSOCollect du Web DCC (cdd-backend : coso_collect/api_views.py, préfixe api/coso-collect/).
 *
 * Authentification : jeton signé obtenu avec l'identifiant et le mot de passe saisis à la connexion
 * (déjà conservés par Login.tsx), envoyé dans `Authorization: Token <jeton>`. Redemandé une fois si le
 * serveur répond 401 (jeton expiré, mot de passe changé).
 */
import axios from 'axios';
import { Platform } from 'react-native';

import { cddBaseURL } from '../env';
import { getData, removeValue, storeData } from '../../utils/storageManager';

const TOKEN_KEY = 'cosocollect_api_token';
const TIMEOUT = 30000;
const UPLOAD_TIMEOUT = 120000;

export class CollectAuthError extends Error {}

export type CollectFormSummary = {
  id: number;
  uid: string;
  title: string;
  description: string;
  version: number;
  status: 'published' | 'closed' | 'draft';
  close_message: string;
  /** Un seul enregistrement par personne (sinon : autant que voulu). */
  single_submission?: boolean;
  published_at: string | null;
  closed_at: string | null;
  updated_at: string | null;
  my_counts: Record<string, number>;
};

export type CollectFormDefinition = CollectFormSummary & { form: any[]; title_template: any };

export type ServerSubmission = {
  uuid: string;
  form_id: number;
  form_version: number;
  title: string;
  status: 'draft' | 'completed' | 'submitted';
  editable: boolean;
  locked: boolean;
  data: any[];
  created_at: string | null;
  submitted_at: string | null;
  updated_at: string | null;
  source: string;
  author: string;
};

export type SyncResult = {
  uuid: string;
  ok: boolean;
  code?: string;
  message?: string;
  submission?: ServerSubmission;
};

const apiRoot = () => `${String(cddBaseURL || '').replace(/\/+$/, '')}/api/coso-collect`;

/** Les identifiants sont stockés doublement encodés (Login.tsx : storeData(k, JSON.stringify(v))). */
async function readCredential(key: string): Promise<string | null> {
  const value = await getData(key);
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}

/** Compte connecté : sert aussi de clé de rangement des données locales (`owner_key`). */
export async function currentOwnerKey(): Promise<string> {
  return String((await readCredential('username')) || '').trim().toLowerCase();
}

let memoryToken: { owner: string; token: string } | null = null;

async function login(owner: string): Promise<string> {
  const username = await readCredential('username');
  const password = await readCredential('password');
  if (!username || !password) throw new CollectAuthError('missing_credentials');
  try {
    const { data } = await axios.post(`${apiRoot()}/auth/token/`, { username, password }, { timeout: TIMEOUT });
    memoryToken = { owner, token: data.token };
    await storeData(TOKEN_KEY, memoryToken);
    return data.token;
  } catch (err: any) {
    if (err?.response && [400, 401].includes(err.response.status)) throw new CollectAuthError('invalid_credentials');
    throw err;
  }
}

async function token(): Promise<string> {
  const owner = await currentOwnerKey();
  if (memoryToken && memoryToken.owner === owner) return memoryToken.token;
  const stored = await getData(TOKEN_KEY);
  if (stored && stored.owner === owner && stored.token) {
    memoryToken = stored;
    return stored.token;
  }
  return login(owner);
}

/** Jeton déjà connu (sans appel réseau) : pour afficher une photo stockée sur le serveur. */
export function cachedToken(): string | null {
  return memoryToken ? memoryToken.token : null;
}

async function request(config: any, retry = true): Promise<any> {
  const access = await token();
  try {
    return await axios({
      timeout: TIMEOUT,
      ...config,
      url: `${apiRoot()}${config.url}`,
      headers: { ...(config.headers || {}), Authorization: `Token ${access}` },
    });
  } catch (err: any) {
    if (retry && err?.response?.status === 401) {
      memoryToken = null;
      await removeValue(TOKEN_KEY);
      return request(config, false);
    }
    throw err;
  }
}

export async function fetchCollectForms(): Promise<CollectFormSummary[]> {
  const { data } = await request({ method: 'get', url: '/forms/' });
  return data.forms || [];
}

export async function fetchCollectForm(id: number): Promise<CollectFormDefinition> {
  const { data } = await request({ method: 'get', url: `/forms/${id}/` });
  return data.form;
}

export async function fetchMySubmissions(formId: number, since?: string | null): Promise<{
  form: CollectFormSummary; submissions: ServerSubmission[]; server_time: string;
}> {
  const { data } = await request({ method: 'get', url: `/forms/${formId}/submissions/`, params: since ? { since } : {} });
  return data;
}

export async function pushSubmissions(formId: number, submissions: any[]): Promise<{
  form: CollectFormSummary; results: SyncResult[];
}> {
  const { data } = await request({ method: 'post', url: `/forms/${formId}/submissions/sync/`, data: { submissions } });
  return data;
}

export async function uploadCollectFile(params: {
  formId: number; submissionUuid: string; fieldPath: string; uri: string; name: string; mime: string;
}): Promise<{ attachment_id: number; name: string; mime: string; size: number }> {
  const body = new FormData();
  body.append('form_id', String(params.formId));
  body.append('submission_uuid', params.submissionUuid);
  body.append('field_path', params.fieldPath);
  body.append('file', {
    uri: Platform.OS === 'android' ? params.uri : params.uri.replace('file://', ''),
    name: params.name,
    type: params.mime || 'application/octet-stream',
  } as any);
  const { data } = await request({
    method: 'post', url: '/attachments/upload/', data: body, timeout: UPLOAD_TIMEOUT,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.attachment;
}

/** Adresse d'une pièce jointe déjà reçue par le serveur (jeton dans l'URL : lisible par <Image>). */
export function attachmentUrl(attachmentId: number | string): string | null {
  const access = cachedToken();
  if (!access) return null;
  return `${apiRoot()}/attachments/${attachmentId}/?token=${encodeURIComponent(access)}`;
}

/** Le serveur répond-il « ok » sur `/health/` ? Testé avant chaque synchronisation : un serveur
 * indisponible ne fait pas attendre l'utilisateur jusqu'au délai réseau de chaque requête. */
export async function isServerHealthy(): Promise<boolean> {
  try {
    const { data } = await axios.get(`${String(cddBaseURL || '').replace(/\/+$/, '')}/health/`, { timeout: 5000 });
    return typeof data === 'string' && data.trim().toLowerCase() === 'ok';
  } catch (err) {
    return false;
  }
}

/** Prépare le jeton (appelé à l'ouverture du module) pour que les photos du serveur s'affichent. */
export async function warmUpCollectToken(): Promise<void> {
  try {
    await token();
  } catch (err) {
    // hors connexion : les photos déjà présentes sur l'appareil restent affichables
  }
}
