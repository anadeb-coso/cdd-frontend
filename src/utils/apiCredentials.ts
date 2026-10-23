/**
 * Identification envoyée aux API du DCC et du SIG (dans le corps des requêtes) et au MGP (en-tête Authorization).
 *
 * Depuis la connexion par jeton : le DCC renvoie à la connexion un jeton de session (`access`), valable sur le DCC,
 * le SIG et le MGP ; le mot de passe n'est plus gardé sur l'appareil. Une session ouverte avec une version précédente
 * de l'application (mot de passe encore rangé, pas de jeton) continue de fonctionner jusqu'à sa conversion
 * (`ensureSessionToken`) ou la prochaine connexion.
 */
import { getData } from './storageManager';

/** Les valeurs de session sont rangées doublement encodées (storeData(k, JSON.stringify(v))). */
export async function readSessionValue(key: string): Promise<any> {
  const value = await getData(key);
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
}

/** Jeton de session de la connexion au mobile (null : session d'une version précédente, ou déconnecté). */
export async function sessionToken(): Promise<string | null> {
  const token = await readSessionValue('access');
  return typeof token === 'string' && token ? token : null;
}

/** Preuve d'identité à joindre à l'identifiant : le jeton, ou à défaut le mot de passe d'une ancienne session. */
export async function apiSecret(): Promise<{ token: string } | { password: string }> {
  const token = await sessionToken();
  if (token) return { token };
  return { password: (await readSessionValue('password')) ?? '' };
}

/** Identifiant + jeton (ou mot de passe d'une ancienne session), pour le corps des requêtes DCC / SIG. */
export async function apiCredentials(): Promise<{ username: string; token?: string; password?: string }> {
  return { username: (await readSessionValue('username')) ?? '', ...(await apiSecret()) };
}
