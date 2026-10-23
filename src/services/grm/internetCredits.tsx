/**
 * Confirmations de réception du forfait internet CVGP, côté FC/AC, via l'API REST du MGP
 * (grm-backend : /api/internet-credits/, cf. internet_credits/api_views.py).
 *
 * Authentification : jeton de session du mobile, délivré par le DCC à la connexion et accepté par le MGP
 * (`Authorization: Bearer cps_...`, compte MGP de même e-mail). Pour une session ouverte avant les jetons :
 * JWT MGP obtenu avec l'e-mail et le mot de passe gardés (le CDD recopie les mots de passe vers le MGP,
 * cf. grm_client.py::set_user_password côté CDD), rangé dans AsyncStorage, vidé à la déconnexion.
 *
 * Contrairement au MGP mobile (WatermelonDB, hors-ligne), le DCC n'a pas de base locale pour ces
 * données : une connexion internet est requise.
 */
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { grmBaseURL } from '../env';
import { getData, removeValue, storeData } from '../../utils/storageManager';
import { sessionToken } from '../../utils/apiCredentials';
import { reportRefusedToken } from '../../utils/sessionToken';

const TOKENS_KEY = 'grm_internet_credit_tokens';
const TIMEOUT = 20000;

export type ConfirmationSummary = { id: string; confirmed_by_name: string; confirmed_at: string };
export type InternetCreditNotification = {
  id: string;
  role: 'cvgp' | 'fc';
  message: string;
  campaign: {
    id: string; period: string; month_label: string; sent_date: string | null;
    package_label: string; amount: number;
  };
  cvd_name: string;
  village_names: string;
  member_name: string;
  phone_number: string;
  my_confirmation: ConfirmationSummary | null;
  cvgp_confirmation: ConfirmationSummary | null;
  fc_confirmations: ConfirmationSummary[];
};

export class GrmAuthError extends Error {}

const grmApiRoot = () => `${String(grmBaseURL || '').replace(/\/+$/, '')}/api`;

/** Les identifiants du DCC sont stockés doublement encodés (Login.tsx : storeData(k, JSON.stringify(v))). */
async function readCredential(key: string): Promise<string | null> {
  const value = await getData(key);
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}

async function login(): Promise<string> {
  // L'e-mail du compte (renvoyé par le DCC à la connexion, Login.tsx) et non l'identifiant saisi :
  // le MGP ne connaît pas les identifiants DCC (« nandjo.fatoumata »), d'où un refus systématique
  // (« Impossible de se connecter au MGP ») même avec le bon mot de passe.
  const username =
    (await readCredential('email')) || (await readCredential('username'));
  const password = await readCredential('password');
  if (!username || !password) throw new GrmAuthError('missing_credentials');
  try {
    const { data } = await axios.post(`${grmApiRoot()}/auth/token/`, { username, password }, { timeout: TIMEOUT });
    await storeData(TOKENS_KEY, data);
    return data.access;
  } catch (err: any) {
    if (err?.response && [400, 401].includes(err.response.status)) throw new GrmAuthError('invalid_credentials');
    throw err;
  }
}

async function request(config: any, retry = true): Promise<any> {
  // Jeton de session du mobile, délivré par le DCC et accepté par le MGP (PlatformTokenAuthentication du MGP)
  const platformToken = await sessionToken();
  if (platformToken) {
    try {
      return await axios({
        ...config,
        url: `${grmApiRoot()}/internet-credits${config.url}`,
        timeout: TIMEOUT,
        headers: { ...(config.headers || {}), Authorization: `Bearer ${platformToken}` },
      });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // jeton refusé : fenêtre de reconnexion si le DCC confirme que la session n'est plus valable
        reportRefusedToken(platformToken);
        throw new GrmAuthError('session_expired');
      }
      if (err?.response?.status === 403 && err.response.data?.no_grm_account) {
        throw new GrmAuthError('no_grm_account'); // pas de compte MGP (ex. compte de formation) : pas une session expirée
      }
      throw err;
    }
  }
  // Session d'avant les jetons : JWT du MGP obtenu avec l'e-mail et le mot de passe gardés
  const tokens = await getData(TOKENS_KEY);
  const access = tokens?.access || (await login());
  try {
    return await axios({
      ...config,
      url: `${grmApiRoot()}/internet-credits${config.url}`,
      timeout: TIMEOUT,
      headers: { ...(config.headers || {}), Authorization: `Bearer ${access}` },
    });
  } catch (err: any) {
    if (retry && err?.response?.status === 401) {
      await removeValue(TOKENS_KEY); // jeton expiré ou révoqué : nouvelle connexion une fois
      return request(config, false);
    }
    throw err;
  }
}

export async function fetchInternetCreditNotifications(): Promise<InternetCreditNotification[]> {
  const { data } = await request({ method: 'get', url: '/notifications/' });
  return data.results || [];
}

export async function confirmInternetCredit(payload: {
  beneficiary: string; checked: boolean; signature: string; description?: string; message?: string;
}) {
  const { data } = await request({
    method: 'post',
    url: '/confirmations/',
    data: { ...payload, confirmed_at: new Date().toISOString() },
  });
  return data;
}

// ---------------------------------------------------------------------------
// État partagé (icône de l'en-tête + écrans) : un seul chargement, tous les abonnés notifiés.
// ---------------------------------------------------------------------------

type State = { items: InternetCreditNotification[]; loading: boolean; error: string | null; owner: string | null };
let state: State = { items: [], loading: false, error: null, owner: null };
const listeners = new Set<(s: State) => void>();
let inFlight: Promise<void> | null = null;

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
}

export function refreshInternetCreditNotifications(): Promise<void> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    // L'état survit à une déconnexion (module JS) : on l'efface si un autre compte est connecté.
    const owner = await readCredential('username');
    setState(owner !== state.owner ? { items: [], error: null, owner, loading: true } : { loading: true });
    const items = await fetchInternetCreditNotifications();
    setState({ items, loading: false, error: null });
  })()
    .catch((err) => {
      const error = err instanceof GrmAuthError ? (err.message === 'no_grm_account' ? 'no_grm_account' : 'login_failed')
        : err?.response ? 'load_error' : 'network_required';
      setState({ loading: false, error });
    })
    .finally(() => { inFlight = null; });
  return inFlight;
}

export function useInternetCreditNotifications() {
  const [current, setCurrent] = useState<State>(state);
  useEffect(() => {
    listeners.add(setCurrent);
    setCurrent(state);
    return () => { listeners.delete(setCurrent); };
  }, []);
  const refresh = useCallback(() => refreshInternetCreditNotifications(), []);
  return { ...current, refresh };
}
