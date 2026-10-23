/**
 * Déconnexion et saisies COSOCollect pas encore envoyées.
 *
 * Les saisies restent rangées sur le téléphone sous le compte qui les a faites : un autre compte qui se
 * connecte ne les voit pas et ne les envoie pas (elles partiraient sous son nom). Elles ne partent donc
 * qu'à la prochaine connexion du même compte sur CE téléphone. Avant de se déconnecter, on prévient et on
 * propose de les envoyer — même principe que l'app mobile du MGP (WorkInProgress::onLogoutPress).
 */
import { Alert } from 'react-native';

import i18n from '../../translations/i18n';
import { currentOwnerKey } from './api';
import { getDirtySubmissions } from './store';
import { syncCollect } from './sync';

const tr = (key: string, options: any = {}) => i18n.t(`coso_collect:sign_out_guard.${key}`, options) as string;

/** Saisies du compte connecté modifiées sur le téléphone et pas encore reçues par le serveur. */
export async function pendingCollectSubmissions(): Promise<number> {
  try {
    const owner = await currentOwnerKey();
    return owner ? (await getDirtySubmissions(owner)).length : 0;
  } catch (err) {
    return 0; // vérification impossible : on ne bloque pas la déconnexion
  }
}

function askLogoutAnyway(count: number, onSignOut: () => void, allowSync: boolean) {
  const buttons: any[] = [{ text: tr('cancel', { defaultValue: 'Annuler' }), style: 'cancel' }];
  if (allowSync) {
    buttons.push({
      text: tr('sync_first', { defaultValue: 'Envoyer d’abord' }),
      onPress: async () => {
        await syncCollect(undefined, { ownIndicator: false });
        const left = await pendingCollectSubmissions();
        if (!left) onSignOut();
        else askLogoutAnyway(left, onSignOut, false);
      },
    });
  }
  buttons.push({ text: tr('logout_anyway', { defaultValue: 'Se déconnecter quand même' }), style: 'destructive', onPress: onSignOut });
  Alert.alert(
    tr('title', { defaultValue: 'Saisies non envoyées' }),
    tr('message', {
      count,
      defaultValue: '{{count}} saisie(s) COSOCollect ne sont pas encore envoyées. Elles restent sur ce téléphone et '
        + 'ne partiront qu’à la prochaine connexion de ce compte ici ; un autre compte ne les verra pas.',
    }),
    buttons,
  );
}

/** Déconnecte tout de suite s'il n'y a rien en attente ; sinon demande confirmation (et propose d'envoyer
 * d'abord, sauf `allowSync: false` : jeton refusé, l'envoi échouerait). */
export async function confirmSignOut(onSignOut: () => void, options: { allowSync?: boolean } = {}): Promise<void> {
  const count = await pendingCollectSubmissions();
  if (!count) {
    onSignOut();
    return;
  }
  askLogoutAnyway(count, onSignOut, options.allowSync !== false);
}
