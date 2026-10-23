import * as SecureStore from 'expo-secure-store';
import { storeData } from './storageManager';
import { resetSessionExpired, storeSessionToken } from './sessionToken';

// Données gardées après une connexion réussie (écran de connexion, ou connexion automatique après le changement
// du mot de passe initial) : identifiant, jeton de session et profil renvoyés par `authentication/obtain-auth-credentials/`.
// Le mot de passe n'est plus gardé : le jeton (valable sur le DCC, le SIG et le MGP) le remplace dans les appels. Un
// serveur DCC d'avant les jetons (pas de `access` dans la réponse) : mot de passe gardé comme auparavant.
export async function storeSignInSession(login: string, password: string, response: any) {
  await storeData('username', JSON.stringify(login));
  if (!(await storeSessionToken(response))) {
    await storeData('password', JSON.stringify(password));
  }
  resetSessionExpired();
  await storeData('is_superuser', JSON.stringify(response?.is_superuser));
  await storeData('name', JSON.stringify(response?.name));
  await storeData('first_name', JSON.stringify(response?.first_name));
  await storeData('last_name', JSON.stringify(response?.last_name));
  await storeData('email', JSON.stringify(response?.email));
  await storeData('groups', JSON.stringify(response?.groups));

  await storeData('no_sql_dbs_names', JSON.stringify(response?.no_sql_dbs_names));
}

export async function saveSecureSession(response: any) {
  await SecureStore.setItemAsync('session', JSON.stringify(response));
}
