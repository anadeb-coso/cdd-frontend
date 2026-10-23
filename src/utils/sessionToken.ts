/**
 * Jeton de session du mobile (délivré par le DCC à la connexion, valable sur le DCC, le SIG et le MGP) :
 * conversion d'une session ouverte avant les jetons, renouvellement avant expiration, révocation à la déconnexion,
 * et signal « session expirée » (jeton refusé par un serveur) écouté par le contexte d'authentification.
 */
import { cddBaseURL } from '../services/env';
import { readSessionValue, sessionToken } from './apiCredentials';
import { removeValue, storeData } from './storageManager';

const DAY = 24 * 60 * 60 * 1000;

/** Jeton renvoyé par le DCC ({access, access_expires_at, access_renew_before_days}) : rangé, mot de passe effacé. */
export async function storeSessionToken(response: any): Promise<boolean> {
  if (!response?.access) return false;
  await storeData('access', JSON.stringify(response.access));
  await storeData('access_expires_at', JSON.stringify(response.access_expires_at ?? null));
  await storeData('access_renew_before_days', JSON.stringify(response.access_renew_before_days ?? 30));
  await removeValue('password');
  return true;
}

async function post(path: string, body: any): Promise<any> {
  const response = await fetch(`${cddBaseURL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json().catch(() => null) };
}

/**
 * Au démarrage de l'application (connexion internet requise, sinon rien n'est fait) :
 * - session d'une version précédente (mot de passe gardé, pas de jeton) : échange contre un jeton, mot de passe effacé ;
 * - jeton proche de l'expiration : renouvelé ; jeton refusé : session expirée.
 */
export async function ensureSessionToken(): Promise<void> {
  try {
    const token = await sessionToken();
    if (!token) {
      const username = await readSessionValue('username');
      const password = await readSessionValue('password');
      if (!username || !password) return;
      const { status, data } = await post('authentication/api/token/', { username, password });
      if (status === 200) await storeSessionToken(data);
      // mot de passe gardé devenu faux (changé ailleurs) ou à changer : fenêtre de reconnexion
      else if (status === 400 || status === 403) notifySessionExpired();
      return;
    }
    const expiresAt = Date.parse((await readSessionValue('access_expires_at')) || '');
    const renewBeforeDays = Number(await readSessionValue('access_renew_before_days')) || 30;
    if (Number.isNaN(expiresAt) || expiresAt - Date.now() > renewBeforeDays * DAY) return;
    const { status, data } = await post('authentication/api/token/renew/', { token });
    if (status === 200) await storeSessionToken(data);
    else if (status === 401 && data?.token_invalid) notifySessionExpired();
  } catch (err) {
    // hors connexion : nouvel essai au prochain démarrage
  }
}

/** Déconnexion : le jeton ne vaut plus sur aucune plateforme (au mieux : hors connexion, il expirera). */
export async function revokeSessionToken(token: string | null): Promise<void> {
  if (!token) return;
  try {
    await post('authentication/api/token/revoke/', { token });
  } catch (err) {
    // hors connexion
  }
}

// ---------------------------------------------------------------------------
// Session expirée (jeton refusé par le DCC, le SIG ou le MGP) : un seul signal tant que la session n'est pas rouverte.
// ---------------------------------------------------------------------------
type Listener = () => void;
const listeners = new Set<Listener>();
let expiredNotified = false;

export function onSessionExpired(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function notifySessionExpired(): void {
  if (expiredNotified) return;
  expiredNotified = true;
  listeners.forEach((listener) => listener());
}

/**
 * Requête refusée pour cause de jeton par un serveur (DCC, SIG, MGP) : la fenêtre « Session expirée » ne s'ouvre que
 * si le refus concerne bien la session en cours. Ignoré :
 * - déconnecté, ou jeton refusé différent du jeton actuel (réponse tardive d'une requête du compte précédent) ;
 * - jeton encore valable selon le DCC (refus pour une autre raison, ex. pas de compte sur le MGP) ;
 * - DCC injoignable : rien ne permet de conclure, la prochaine requête refusée redemandera.
 * `tokenUsed` : jeton envoyé avec la requête refusée, s'il est connu.
 */
export async function reportRefusedToken(tokenUsed?: string | null): Promise<void> {
  if (expiredNotified) return;
  const current = await sessionToken();
  if (!current || (tokenUsed && tokenUsed !== current)) return;
  try {
    const { status, data } = await post('authentication/api/token/check/', { token: current });
    if (status === 200 && data?.valid === true) return;
    if (status !== 200 && status !== 404) return; // 404 : DCC sans cette vérification, le refus fait foi
  } catch (err) {
    return;
  }
  if ((await sessionToken()) === current) notifySessionExpired();
}

/** Nouvelle session ouverte : un prochain refus du jeton sera de nouveau signalé. */
export function resetSessionExpired(): void {
  expiredNotified = false;
}

/** Réponse d'une API indiquant un jeton refusé (`token_invalid`, DCC / SIG / MGP), y compris quand la vue renvoie
 * l'erreur de validation sous forme de texte ({error: "{... 'token_invalid': ...}"}). */
export function isTokenInvalidResponse(response: any): boolean {
  if (!response || typeof response !== 'object') return false;
  const flag = response.token_invalid;
  if (Array.isArray(flag)) return flag.length > 0 && String(flag[0]).toLowerCase() !== 'false';
  if (flag) return true;
  return typeof response.error === 'string' && response.error.includes('token_invalid');
}
