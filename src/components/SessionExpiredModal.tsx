import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import AuthContext from '../contexts/auth';
import API from '../services/API';
import { readSessionValue } from '../utils/apiCredentials';
import { isPasswordChangeRequired } from '../utils/firstLoginPassword';
import { saveSecureSession } from '../utils/signInSession';
import { onSessionExpired, resetSessionExpired, storeSessionToken } from '../utils/sessionToken';
import { confirmSignOut } from '../services/collect/signOutGuard';

/**
 * Jeton de session refusé par le DCC, le SIG ou le MGP (expiré, révoqué, mot de passe changé ailleurs) : la personne
 * saisit à nouveau son mot de passe pour obtenir un nouveau jeton, sans déconnexion (la déconnexion efface les données
 * locales de l'application). Elle peut aussi choisir de se déconnecter.
 */
function SessionExpiredModal() {
  const { t } = useTranslation('core');
  const { signOut } = useContext(AuthContext);
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => onSessionExpired(() => {
    setPassword('');
    setMessage(null);
    setVisible(true);
  }), []);

  const reconnect = async () => {
    setLoading(true);
    setMessage(null);
    const username = await readSessionValue('username');
    const response: any = await new API().login({ username, password });
    setLoading(false);
    if (isPasswordChangeRequired(response)) {
      setMessage(t('session_expired.password_change_required'));
      return;
    }
    if (!response || response.error || !(await storeSessionToken(response))) {
      setMessage(t('session_expired.failed'));
      return;
    }
    await saveSecureSession(response);
    resetSessionExpired();
    setVisible(false);
  };

  const logout = () => {
    // jeton refusé : impossible d'envoyer d'abord, on prévient seulement
    confirmSignOut(() => {
      setVisible(false);
      resetSessionExpired();
      signOut();
    }, { allowSync: false });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => undefined}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20 }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', marginBottom: 8 }}>{t('session_expired.title')}</Text>
          <Text style={{ color: '#555', marginBottom: 14 }}>{t('session_expired.message')}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder={t('session_expired.password_placeholder')}
            style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }}
          />
          {message ? <Text style={{ color: '#c0392b', marginTop: 10 }}>{message}</Text> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 18 }}>
            <TouchableOpacity onPress={logout} style={{ paddingVertical: 8, paddingHorizontal: 12 }} disabled={loading}>
              <Text style={{ color: '#777' }}>{t('session_expired.sign_out_action')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={reconnect}
              disabled={loading || !password}
              style={{ backgroundColor: password ? '#24c38b' : '#a8e6cf', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, marginLeft: 8 }}
            >
              {loading ? <ActivityIndicator size="small" color="white" />
                : <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('session_expired.reconnect_action')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default SessionExpiredModal;
