import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Keyboard,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useToast } from 'native-base';
import { cddBaseURL } from '../../../services/env';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { HStack } from 'native-base';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import styles from './ProfileScreen.style';
import MESSAGES from '../../../utils/formErrorMessages';
import { emailRegex, passwordRegex } from '../../../utils/formUtils';
import * as Linking from 'expo-linking';
import { storeData, getData } from '../../../utils/storageManager';
import { validatePassword } from '../../../utils/functions';
import AuthContext from '../../../contexts/auth';
import ProjectContext from "../../../contexts/project";

function ProfileScreen() {
  const { t } = useTranslation(['settings', 'common']);
  const toast = useToast();
  const { signOut } = useContext(AuthContext);
  const { selectProject } = useContext(ProjectContext)

  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isCurrentPasswordSecure, setIsCurrentPasswordSecure] = useState(true);
  const [isConfirmPasswordSecure, setIsConfirmPasswordSecure] = useState(true);
  
  const [password, setPassword]: any = useState(null);
  const [currentPassword, setCurrentPassword]: any = useState(null);
  const [_validatePassword, set_validatePassword]: any = useState(null);
  const [isPasswordConfirm, setIsPasswordConfirm]: any = useState(null);

  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [encoderEmail, setEncoderEmail] = useState(null);

  const [error, setError] = useState(null);

  const onPress = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${cddBaseURL}api/change-password/`,
        { ...data, email: JSON.parse(await getData('email')) }, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 200 && response.data.ok == true) {
        toast.show({
          description: response.data.message,
        });
        setLoading(false);
        
        selectProject(null);
        signOut();
      } else {
        Alert.alert(t('common:error'), response.data.message);
        setLoading(false);
        setError(response.data.message);
      }

    } catch (error: any) {
      Alert.alert(t('common:error'), error.message);
      setError(error.message);
      setLoading(false);
    }



    // show error
  };


  const { control, handleSubmit, errors } = useForm({
    criteriaMode: 'all',
  });

  return (
    <ScrollView
      style={{
        backgroundColor: 'white',
        paddingBottom: 30,
        paddingHorizontal: 30,
      }}
      contentContainerStyle={{ flexGrow: 1 }}
    >

      {codeSent ?
        <KeyboardAvoidingView
          style={{
            flex: 1,
            backgroundColor: 'white',
            justifyContent: 'space-between',
            marginBottom: 50,
            marginTop: 50,
          }}
          contentContainerStyle={{ flex: 1, justifyContent: 'space-evenly' }}
          behavior="position"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
              <View
                style={{
                  backgroundColor: 'white',
                }}
              >
                <KeyboardAvoidingView
                  style={{
                    backgroundColor: 'white',
                  }}
                  behavior="padding"
                >
                  <View style={[styles.formContainer]}>
                    <View
                      style={{
                        borderRadius: 10,
                        marginBottom: 3,
                      }}
                    >


                      <Controller
                        control={control}
                        render={({ onChange, onBlur, value }) => (
                          <View style={{ flexDirection: 'row' }}>
                            <TextInput
                              theme={{
                                roundness: 10,
                                colors: {
                                  primary: '#24c38b',
                                  placeholder: '#dedede',
                                },
                              }}
                              mode="outlined"
                              label={t('profile_screen.confirmation_code_label')}
                              style={{
                                flex: 1,
                              }}
                              left
                              value={value}
                              onBlur={onBlur}
                              onChangeText={onChange}
                            />
                          </View>
                        )}
                        name="confirm_code"
                        rules={{
                          required: {
                            value: true,
                            message: MESSAGES.required,
                          }
                        }}
                        defaultValue=""
                      />

                      <Text style={{ color: 'gray' }}>
                        {t('profile_screen.confirmation_code_sent_message', { email: encoderEmail ? '(' + encoderEmail + ')' : '' })}
                      </Text>


                      {/* Current PAssword */}
                      <View style={{ height: 30 }} />
                      <Controller
                        control={control}
                        render={({ onChange, onBlur, value }) => (
                          <View style={{ flexDirection: 'row' }}>
                            <Ionicons
                              onPress={() =>
                                setIsCurrentPasswordSecure(!isCurrentPasswordSecure)
                              }
                              name={
                                isCurrentPasswordSecure
                                  ? 'eye-off-outline'
                                  : 'eye-outline'
                              }
                              color="#24c38b"
                              size={30}
                              style={{ textAlignVertical: 'center', marginRight: 5 }}
                            />
                            <TextInput
                              theme={{
                                roundness: 10,
                                colors: {
                                  primary: '#24c38b',
                                  placeholder: '#dedede',
                                },
                              }}
                              mode="outlined"
                              label={t('profile_screen.current_password_label')}
                              style={{
                                flex: 1,
                              }}
                              left
                              value={value}
                              onBlur={onBlur}
                              onChangeText={(text: any) => {
                                onChange(text);
                                setCurrentPassword(text);
                              }}
                              secureTextEntry={isCurrentPasswordSecure}
                            />
                          </View>
                        )}
                        name="current_password"
                        rules={{
                          required: {
                            value: true,
                            message: MESSAGES.required,
                          },
                        }}
                        defaultValue=""
                      />
                      {/* End Current PAssword */}



                      {/* New Password */}
                      <View style={{ height: 10 }} />
                      <Controller
                        control={control}
                        render={({ onChange, onBlur, value }) => (
                          // <HStack style={styles.loginInputContainer} space={2}>
                          <View style={{ flexDirection: 'row' }}>
                            <Ionicons
                              onPress={() =>
                                setIsPasswordSecure(!isPasswordSecure)
                              }
                              name={
                                isPasswordSecure
                                  ? 'eye-off-outline'
                                  : 'eye-outline'
                              }
                              color="#24c38b"
                              size={30}
                              style={{ textAlignVertical: 'center', marginRight: 5 }}
                            />
                            <TextInput
                              // placeholder="Nouveau mot de passe"
                              theme={{
                                roundness: 10,
                                colors: {
                                  primary: '#24c38b',
                                  placeholder: '#dedede',
                                },
                              }}
                              mode="outlined"
                              label={t('profile_screen.new_password_label')}
                              style={{
                                flex: 1,
                              }}
                              left
                              value={value}
                              onBlur={onBlur}
                              onChangeText={(text: any) => {
                                onChange(text);
                                setPassword(text);
                                set_validatePassword(validatePassword(text));
                              }}
                              secureTextEntry={isPasswordSecure}
                            />
                            {/* </HStack> */}
                          </View>
                        )}
                        name="password_new"
                        rules={{
                          required: {
                            value: true,
                            message: MESSAGES.required,
                          },
                          minLength: {
                            value: 8,
                            message: MESSAGES.minLength,
                          },
                          pattern: {
                            value: passwordRegex,
                            message: MESSAGES.password,
                          },
                          maxLength: {
                            value: 40,
                            message: MESSAGES.maxLength,
                          },
                        }}
                        defaultValue=""
                      />
                      {errors.password && (
                        <Text style={styles.errorText}>
                          {errors.password.message}
                        </Text>
                      )}
                      {_validatePassword != true && (
                        <Text style={styles.errorText}>
                          {_validatePassword}
                        </Text>
                      )}
                      <Text style={{ color: 'gray' }}>{t('profile_screen.new_password_instructions')}</Text>

                      {/* End New Password */}



                      {/* Confirm New Password */}
                      <View style={{ height: 10 }} />
                      <Controller
                        control={control}
                        render={({ onChange, onBlur, value }) => (
                          <View style={{ flexDirection: 'row' }}>
                            <Ionicons
                              onPress={() =>
                                setIsConfirmPasswordSecure(!isConfirmPasswordSecure)
                              }
                              name={
                                isConfirmPasswordSecure
                                  ? 'eye-off-outline'
                                  : 'eye-outline'
                              }
                              color="#24c38b"
                              size={30}
                              style={{ textAlignVertical: 'center', marginRight: 5 }}
                            />
                            <TextInput
                              theme={{
                                roundness: 10,
                                colors: {
                                  primary: '#24c38b',
                                  placeholder: '#dedede',
                                },
                              }}
                              mode="outlined"
                              label={t('profile_screen.confirm_new_password_label')}
                              style={{
                                flex: 1,
                              }}
                              left
                              value={value}
                              onBlur={onBlur}
                              onChangeText={(text: any) => {
                                onChange(text);
                                setIsPasswordConfirm(text == password);
                              }}
                              secureTextEntry={isConfirmPasswordSecure}
                            />
                          </View>
                        )}
                        name="password_new_confirm"
                        rules={{
                          required: {
                            value: true,
                            message: MESSAGES.required,
                          },
                          minLength: {
                            value: 8,
                            message: MESSAGES.minLength,
                          },
                          pattern: {
                            value: passwordRegex,
                            message: MESSAGES.password,
                          },
                          maxLength: {
                            value: 40,
                            message: MESSAGES.maxLength,
                          },
                        }}
                        defaultValue=""
                      />
                      {errors.password && (
                        <Text style={styles.errorText}>
                          {errors.password.message}
                        </Text>
                      )}
                      {(!isPasswordConfirm && isPasswordConfirm != null) && (
                        <Text style={styles.errorText}>
                          {t('profile_screen.password_confirmation_mismatch')}
                        </Text>
                      )}
                      {/* End Confirm New Password */}



                    </View>
                  </View>
                </KeyboardAvoidingView>


              </View>


              {error && (
                <Text style={styles.errorText}>
                  {error}
                </Text>
              )}

              <View
                style={{
                  backgroundColor: 'white',
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#24c38b" />
                ) : (
                  <TouchableOpacity 
                    disabled={_validatePassword != true || _validatePassword == null || !isPasswordConfirm || isPasswordConfirm == null || currentPassword == null}
                    style={{
                      height: 42,
                      borderRadius: 7,
                      backgroundColor: (
                        (_validatePassword != true || _validatePassword == null || !isPasswordConfirm || isPasswordConfirm == null || currentPassword == null) ?
                        'gray'
                        : '#24c38b'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignSelf: 'center',
                      paddingHorizontal: 20,
                    }}
                    onPress={handleSubmit(onPress)}
                  >
                    <Text style={{ color: 'white' }}>{t('profile_screen.modify_button')}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView> : <View>
          <View
            style={{
              marginBottom: 50,
              marginTop: 70,
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins_700Bold',
                lineHeight: 22,
                letterSpacing: 0,
                textAlign: 'left',
                color: 'gray',
              }}
            >
              {t('profile_screen.security_notice')}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'white',
            }}
          >
            {sendingCode && <Text style={{ color: 'green' }}>{t('profile_screen.sending_email_message')}</Text>}
            {sendingCode ? (
              <ActivityIndicator color="#24c38b" />
            ) : (
              <TouchableOpacity
                style={{
                  height: 42,
                  borderRadius: 7,
                  backgroundColor: '#24c38b',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  paddingHorizontal: 20,
                }}
                onPress={async () => {
                  setCodeSent(false);
                  setSendingCode(true);
                  try {
                    const response = await axios.post(`${cddBaseURL}api/user-manager-email-notification/`, {
                      email: JSON.parse(await getData('email')),
                      username: JSON.parse(await getData('username')),
                    }, {
                      headers: { 'Content-Type': 'application/json' }
                    });
                    if (response.status === 200) {
                      setCodeSent(true);
                      setSendingCode(false);
                      toast.show({
                        description: response.data.message,
                      });
                      setEncoderEmail(response.data.encoder_email);

                    } else {
                      Alert.alert(t('common:error'), response.data.encoder_email);
                      setSendingCode(false);
                    }

                  } catch (error: any) {
                    Alert.alert(t('common:error'), error.message);
                    setSendingCode(false);
                  }

                }}
              >
                <Text style={{ color: 'white' }}>{t('profile_screen.send_code_button')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>}

    </ScrollView>
  );
}

export default ProfileScreen;
