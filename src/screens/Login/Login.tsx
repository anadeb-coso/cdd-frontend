import React, { useContext, useState } from 'react';

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
  TextInput,
} from 'react-native';

import { Controller, useForm } from 'react-hook-form';
import styles from './Login.style';
import MESSAGES from '../../utils/formErrorMessages';
import { emailRegex, passwordRegex } from '../../utils/formUtils';
import { SyncToRemoteDatabase } from '../../utils/databaseManager';
import AuthContext from '../../contexts/auth';

function Login() {
  const { signIn } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  const onLoginPress = async data => {
    setLoading(true);
    const tryLogin = await SyncToRemoteDatabase({
      username: data?.email, // 'facilitator1',
      password: data?.password, // '123Qwerty',
    });

    if (tryLogin) {
      signIn();
      // navigate
    } else {
      // show error
    }
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
      contentContainerStyle={{ flexGrow: 1,  }}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: 'white',
          justifyContent: 'space-between',
        }}
        contentContainerStyle={{ flex: 1, justifyContent: 'space-evenly' }}
        behavior="position"
      >
        <View
          style={{
            marginBottom: 50,
            marginTop: 70,
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex:0.5
          }}
        >
          <Image
            style={{ height: 130, width: 130, marginBottom: 20 }}
            resizeMode="contain"
            source={require('../../../assets/cdd-logo.png')}
          />
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontSize: 19,
              lineHeight: 22,
              letterSpacing: 0,
              textAlign: 'center',
              color: '#24c38b',
            }}
          >
            Bienvenu! Accédez à votre compte ici
          </Text>
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex:1, justifyContent: 'space-between' }}>
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
                      marginBottom: 16,
                    }}
                  >
                    <Controller
                      control={control}
                      render={({ onChange, onBlur, value }) => (
                        <TextInput
                          placeholder="Email"
                          style={{
                            paddingHorizontal: 10,
                            borderRadius: 10,
                            height: 40,
                            backgroundColor: '#ffffff',
                            borderStyle: 'solid',
                            borderWidth: 1,
                            borderColor: '#d9d9d9',
                          }}
                          onBlur={onBlur}
                          onChangeText={value => onChange(value)}
                          value={value}
                          autoCapitalize="none"
                        />
                      )}
                      name="email"
                      rules={{
                        required: {
                          value: true,
                          message: MESSAGES.required,
                        },
                      }}
                      defaultValue=""
                    />
                    {errors.email && (
                      <Text style={styles.errorText}>
                        {errors.email.message}
                      </Text>
                    )}
                    <View style={{ height: 10 }} />
                    <Controller
                      control={control}
                      render={({ onChange, onBlur, value }) => (
                        <TextInput
                          placeholder="Mot de passe"
                          style={{
                            paddingHorizontal: 10,
                            borderRadius: 10,
                            height: 40,
                            backgroundColor: '#ffffff',
                            borderStyle: 'solid',
                            borderWidth: 1,
                            borderColor: '#d9d9d9',
                          }}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          secureTextEntry={isPasswordSecure}
                        />
                      )}
                      name="password"
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
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>

            <View
              style={{
                backgroundColor: 'white',
              }}
            >
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
                  }}
                  onPress={handleSubmit(onLoginPress)}
                >
                  <Text style={{ color: 'white' }}>SE CONNECTER</Text>
                </TouchableOpacity>
              )}
            </View>
            <View/>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

export default Login;
