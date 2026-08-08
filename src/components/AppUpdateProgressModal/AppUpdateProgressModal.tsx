import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Modal, StyleSheet, View } from 'react-native';
import { Button, ProgressBar, Text } from 'react-native-paper';

import { colors } from '../../utils/colors';

type Phase = 'downloading' | 'installing' | 'error';

type Props = {
  visible: boolean;
  progress: number;
  phase: Phase;
  onRetry: () => void;
  onClose: () => void;
};

// Page plein écran affichée pendant le téléchargement (et l'installation) de la mise à jour APK.
// `onRequestClose` (bouton retour Android) est un no-op tant que `phase` vaut 'downloading' ou
// 'installing' — un Modal React Native intercepte nativement le bouton retour, pour éviter qu'un
// aller-retour accidentel n'interrompe le téléchargement. En cas d'erreur, retour et bouton
// "Fermer" permettent tous les deux de quitter cette page.
function AppUpdateProgressModal({ visible, progress, phase, onRetry, onClose }: Props) {
  const { t } = useTranslation(['app_update', 'common']);
  if (!visible) return null;

  const canClose = phase === 'error';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={canClose ? onClose : () => {}}
    >
      <View style={styles.container}>
        <Image
          source={require('../../../assets/cdd-logo.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          {phase === 'installing'
            ? t('app_update:installing_message')
            : phase === 'error'
              ? t('app_update:download_error')
              : t('app_update:downloading_title')}
        </Text>

        {phase === 'downloading' && (
          <>
            <Text style={styles.message}>{t('app_update:downloading_message')}</Text>
            <ProgressBar
              progress={progress}
              color={colors.primary}
              style={styles.progressBar}
            />
            <Text style={styles.percentage}>{Math.round((progress || 0) * 100)}%</Text>
          </>
        )}

        {phase === 'installing' && (
          <Text style={styles.message}>{t('app_update:installing_detail_message')}</Text>
        )}

        {phase === 'error' && (
          <View style={styles.errorActions}>
            <Button
              mode="outlined"
              onPress={onClose}
              textColor={colors.primary}
              style={styles.closeButton}
            >
              {t('common:close')}
            </Button>
            <Button
              mode="contained"
              onPress={onRetry}
              buttonColor={colors.primary}
              textColor="white"
              style={styles.retryButton}
            >
              {t('common:retry')}
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  image: {
    width: 140,
    height: 140,
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#707070',
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 6,
  },
  percentage: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  errorActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  closeButton: {
    marginRight: 12,
    borderColor: colors.primary,
  },
  retryButton: {},
});

export default AppUpdateProgressModal;
