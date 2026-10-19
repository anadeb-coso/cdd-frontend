/**
 * Fine barre de progression indéterminée, fixée en haut de l'écran, visible sur n'importe quel écran
 * tant qu'une synchronisation COSOCollect automatique est en cours (périodique, retour réseau, retour
 * au premier plan, pendant la saisie) — même principe que SyncProgressBar du MGP mobile. Montée une
 * seule fois à la racine (navigation/main), pour rester visible pendant la navigation.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../utils/colors';
import { subscribeCollectSync } from '../services/collect/sync';

function CollectSyncProgressBar() {
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => subscribeCollectSync((state) => setVisible(state.running && state.showProgress)), []);

  if (!visible) return null;

  return (
    <View style={[styles.container, { top: insets.top }]} pointerEvents="none">
      <ProgressBar indeterminate color={colors.primary} style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  bar: {
    height: 3,
  },
});

export default CollectSyncProgressBar;
