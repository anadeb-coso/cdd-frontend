import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

import { EXPO_PUBLIC_PACKAGE } from '../../services/env';
import { getData, storeData } from '../../utils/storageManager';
import { requestWriteANdInstallPermissions } from '../../utils/permissions';

// Ne demande ces autorisations qu'une seule fois par installation (pas à chaque ouverture de
// l'accueil) — que l'utilisateur les accorde ou les refuse, on respecte son choix plutôt que de
// le relancer sans arrêt. Changer cette clé permet de redéclencher le flux pour tout le monde.
const ASKED_STORAGE_KEY = 'appPermissionsRequestedV1';

// "Installer des applications inconnues" est une autorisation "spéciale" côté Android (depuis
// l'API 26) : contrairement au stockage, il n'existe aucune boîte de dialogue système à demander
// par programmation — seul l'utilisateur peut l'activer manuellement, depuis un écran de
// Paramètres dédié à cette application. On ne peut donc pas non plus vérifier par avance si elle
// est déjà accordée ; on se contente d'expliquer pourquoi elle est utile puis d'ouvrir l'écran
// correspondant, nécessaire pour que la mise à jour auto-installée (cf.
// SnackBarCheckAppVersionComponent/AppUpdateProgressModal) fonctionne.
async function openInstallUnknownAppsSettings() {
  if (Platform.OS !== 'android') return;
  try {
    if (Platform.Version >= 26) {
      await IntentLauncher.startActivityAsync(
        'android.settings.MANAGE_UNKNOWN_APP_SOURCES',
        { data: `package:${EXPO_PUBLIC_PACKAGE}` },
      );
    } else {
      // Avant l'API 26, il s'agit d'un simple interrupteur global (Sécurité > Sources inconnues),
      // pas d'un réglage par application.
      await IntentLauncher.startActivityAsync('android.settings.SECURITY_SETTINGS');
    }
  } catch (err) {
    console.warn('Unable to open "install unknown apps" settings', err);
  }
}

// Demande, une seule fois au premier lancement, les autorisations Android nécessaires au flux de
// mise à jour auto-installée : stockage (pour écrire l'APK téléchargé) et installation
// d'applications inconnues (pour poser l'APK téléchargé). Ne rend rien à l'écran — orchestre
// uniquement des boîtes de dialogue système/natives.
function AppPermissionsRequestComponent() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    (async () => {
      const alreadyAsked = await getData(ASKED_STORAGE_KEY);
      if (alreadyAsked) return;

      await requestWriteANdInstallPermissions();

      await new Promise<void>((resolve) => {
        Alert.alert(
          "Autoriser l'installation de mises à jour",
          "Pour installer automatiquement les mises à jour de l'application, veuillez autoriser \"Installer des applications inconnues\" sur l'écran suivant.",
          [
            { text: 'Annuler', style: 'cancel', onPress: () => resolve() },
            { text: 'Ouvrir les réglages', onPress: () => openInstallUnknownAppsSettings().finally(() => resolve()) },
          ],
          { cancelable: true, onDismiss: () => resolve() },
        );
      });

      await storeData(ASKED_STORAGE_KEY, true);
    })();
  }, []);

  return null;
}

export default AppPermissionsRequestComponent;
