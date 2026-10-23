/**
 * API COSOCollect du Web DCC (cdd-backend : coso_collect/api_views.py, préfixe api/coso-collect/).
 *
 * Authentification : jeton signé COSOCollect obtenu avec le jeton de session du mobile (ou, pour une session
 * d'avant les jetons, l'identifiant et le mot de passe), envoyé dans `Authorization: Token <jeton>`. Redemandé
 * une fois si le serveur répond 401 (jeton expiré, mot de passe changé).
 */
import axios from 'axios';
import { Platform } from 'react-native';

import { cddBaseURL } from '../env';
import { getData, removeValue, storeData } from '../../utils/storageManager';
import { apiCredentials } from '../../utils/apiCredentials';
import { reportRefusedToken } from '../../utils/sessionToken';

const TOKEN_KEY = 'cosocollect_api_token';
// Clé de rangement des données locales du compte (`owner_key`), tirée du compte renvoyé par le serveur
// (« f:<id> » facilitateur, « u:<id> » utilisateur) : la même quel que soit l'identifiant tapé à la
// connexion (nom d'utilisateur ou e-mail, acceptés tous les deux). Effacée à la déconnexion avec le
// reste des données de session, retrouvée à la connexion suivante (cf. sync.ts::ensureCollectOwner).
const OWNER_KEY = 'cosocollect_owner_key';
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

/** Identifiant tapé à la connexion (nom d'utilisateur ou e-mail), en minuscules. */
async function typedLogin(): Promise<string> {
  return String((await readCredential('username')) || '').trim().toLowerCase();
}

/** Compte connecté : sert aussi de clé de rangement des données locales (`owner_key`). Avant que le
 * serveur ait identifié le compte (hors connexion juste après la connexion, ou serveur d'avant ce
 * changement) : l'identifiant tapé, comme auparavant. */
export async function currentOwnerKey(): Promise<string> {
  return (await storedOwner()) || typedLogin();
}

/** Clé du compte déjà identifié, seulement si elle appartient au compte connecté (identifiant tapé parmi
 * ses identifiants) : celle d'un compte précédent n'est jamais reprise par le suivant. */
async function storedOwner(): Promise<string | null> {
  const stored = await getData(OWNER_KEY);
  if (!stored || typeof stored !== 'object' || !stored.owner) return null;
  const typed = await typedLogin();
  return Array.isArray(stored.logins) && stored.logins.includes(typed) ? String(stored.owner) : null;
}

const ownerListeners = new Set<(owner: string) => void>();

/** Prévenu quand la clé du compte change (compte identifié par le serveur) : les écrans relisent. */
export function subscribeOwnerKey(listener: (owner: string) => void): () => void {
  ownerListeners.add(listener);
  return () => { ownerListeners.delete(listener); };
}

export type CollectOwner = { owner: string; aliases: string[] };

/** Clé stable du compte d'après la réponse de `auth/token/`, et les anciennes clés possibles des
 * données déjà rangées sur l'appareil (identifiants de connexion du compte, identifiant tapé). */
async function rememberOwner(account: any): Promise<CollectOwner | null> {
  if (!account || account.id === undefined || account.id === null) return null; // serveur d'avant ce changement
  const owner = `${account.kind === 'facilitator' ? 'f' : 'u'}:${account.id}`;
  const typed = await typedLogin();
  const aliases = Array.from(new Set([typed, ...((account.logins || []) as string[])]
    .map((v) => String(v || '').trim().toLowerCase())
    .filter((v) => v && v !== owner)));
  const previous = await storedOwner();
  await storeData(OWNER_KEY, { owner, logins: Array.from(new Set([typed, ...aliases])) });
  if (previous !== owner) ownerListeners.forEach((l) => l(owner));
  return { owner, aliases };
}

let memoryToken: { owner: string; token: string } | null = null;
let lastResolvedOwner: CollectOwner | null = null;
// Serveur qui n'identifie pas le compte (version d'avant) : inutile de redemander un jeton à chaque synchro.
let ownerUnsupported = false;

async function login(owner: string): Promise<string> {
  // jeton de session du mobile (DCC, SIG, MGP) ; session d'avant les jetons : identifiant + mot de passe
  const credentials = await apiCredentials();
  if (!credentials.username || !(credentials.token || credentials.password)) throw new CollectAuthError('missing_credentials');
  try {
    const { data } = await axios.post(`${apiRoot()}/auth/token/`, credentials, { timeout: TIMEOUT });
    const resolved = await rememberOwner(data.account);
    if (resolved) lastResolvedOwner = resolved;
    else ownerUnsupported = true;
    memoryToken = { owner: resolved ? resolved.owner : owner, token: data.token };
    await storeData(TOKEN_KEY, memoryToken);
    return data.token;
  } catch (err: any) {
    if (err?.response && [400, 401].includes(err.response.status)) {
      // jeton de session refusé : fenêtre de reconnexion
      if (credentials.token) reportRefusedToken(credentials.token);
      throw new CollectAuthError('invalid_credentials');
    }
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

/** Identifie le compte auprès du serveur (jeton redemandé si la clé du compte n'est pas encore connue) et
 * renvoie la clé stable avec les anciennes clés à reprendre ; null si le serveur ne l'a pas identifié
 * (hors connexion, serveur d'avant ce changement). */
export async function resolveCollectOwner(): Promise<CollectOwner | null> {
  const stored = await storedOwner();
  if (stored) {
    const typed = await typedLogin();
    const known = lastResolvedOwner && lastResolvedOwner.owner === stored ? lastResolvedOwner.aliases : [];
    return { owner: stored, aliases: Array.from(new Set([typed, ...known])).filter((v) => v && v !== stored) };
  }
  if (ownerUnsupported) return null;
  lastResolvedOwner = null;
  memoryToken = null; // jeton d'une clé provisoire : on en redemande un pour connaître le compte
  await login(await typedLogin());
  return lastResolvedOwner;
}

/** Déconnexion : rien ne doit survivre en mémoire du compte précédent (jeton, compte identifié). */
export function resetCollectSession(): void {
  memoryToken = null;
  lastResolvedOwner = null;
  ownerUnsupported = false;
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
