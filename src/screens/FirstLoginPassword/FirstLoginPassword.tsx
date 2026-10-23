import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { HStack } from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import styles from '../Login/Login.style';
import AuthContext from '../../contexts/auth';
import API from '../../services/API';
import { firstLoginPasswordPayload, isPasswordChangeRequired, newPasswordErrorKeys } from '../../utils/firstLoginPassword';
import { saveSecureSession, storeSignInSession } from '../../utils/signInSession';

// Changement obligatoire du mot de passe initial (compte créé dans le DCC) avant la première connexion : le
// nouveau mot de passe vaut pour toutes les plateformes (DCC, MGP, SIG). Ouvert par l'écran de connexion avec
// l'identifiant et le mot de passe saisis ; connexion automatique ensuite.
function FirstLoginPassword({ route, navigation }: { route: any; navigation: any }) {
  const { t, i18n } = useTranslation(['core', 'common']);
  const { signIn } = useContext(AuthContext);
  const login: string = route?.params?.login || '';
  const currentPassword: string = route?.params?.currentPassword || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [secure, setSecure] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const errorKeys = newPasswordErrorKeys(newPassword, confirmation, currentPassword);
    setErrors(errorKeys.map(key => t(key)));
    if (errorKeys.length) {
      return;
    }
    setLoading(true);
    const api = new API();
    const result: any = await api.changeInitialPassword(
      firstLoginPasswordPayload(login, currentPassword, newPassword, confirmation, i18n.language),
    );
    if (!result?.ok) {
      setLoading(false);
      const message = result?.message || (result?.error ? t('first_login_password.network_error') : t('first_login_password.error'));
      setErrors([message]);
      return;
    }

    // Connexion avec le nouveau mot de passe.
    const response: any = await api.login({ username: login, password: newPassword });
    setLoading(false);
    if (!response || response.error || isPasswordChangeRequired(response)) {
      Alert.alert(t('common:information'), t('first_login_password.login_again'));
      navigation.navigate('Login');
      return;
    }
    await storeSignInSession(login, newPassword, response);
    Alert.alert(t('common:success'), result.message || t('first_login_password.success'));
    signIn(response);
    saveSecureSession(response);
  };

  const passwordInput = (value: string, onChange: (text: string) => void, placeholder: string) => (
    <HStack style={[styles.loginInputContainer, { marginBottom: 12 }]} space={2} alignItems="center">
      <Ionicons
        onPress={() => setSecure(!secure)}
        name={secure ? 'eye-off-outline' : 'eye-outline'}
        color="#24c38b"
        size={24}
      />
      <TextInput
        placeholder={placeholder}
        style={{ flex: 1 }}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        autoCapitalize="none"
        maxLength={16}
      />
    </HStack>
  );

  return (
    <ScrollView style={{ backgroundColor: 'white', paddingHorizontal: 30 }} contentContainerStyle={{ flexGrow: 1 }}>
      <KeyboardAvoidingView behavior="position">
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#24c38b', marginTop: 30, marginBottom: 10 }}>
          {t('first_login_password.heading')}
        </Text>
        <Text style={{ color: '#333', marginBottom: 20 }}>{t('first_login_password.intro', { login })}</Text>

        {passwordInput(newPassword, setNewPassword, t('first_login_password.new_password_placeholder'))}
        {passwordInput(confirmation, setConfirmation, t('first_login_password.confirm_password_placeholder'))}
        <Text style={{ color: 'gray', marginBottom: 10 }}>{t('first_login_password.rules')}</Text>

        {errors.map(error => (
          <Text key={error} style={styles.errorText}>{error}</Text>
        ))}

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          {loading ? (
            <ActivityIndicator color="#24c38b" />
          ) : (
            <TouchableOpacity
              style={{
                height: 42,
                borderRadius: 7,
                backgroundColor: '#24c38b',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
              }}
              onPress={onSubmit}
            >
              <Text style={{ color: 'white' }}>{t('first_login_password.submit')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

export default FirstLoginPassword;
