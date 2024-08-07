import React, { useContext, useEffect, useState } from 'react';

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
import { HStack } from 'native-base';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import styles from './Login.style';
import MESSAGES from '../../utils/formErrorMessages';
import { emailRegex, passwordRegex } from '../../utils/formUtils';
import AuthContext from '../../contexts/auth';
import API from '../../services/API';
import * as Linking from 'expo-linking';
import { storeData } from '../../utils/storageManager';

async function save(key, value) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

function Login() {
  const { signIn } = useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  const onLoginPress = async data => {
    setLoading(true);

    await new API()
      .login({ username: data?.email, password: data?.password })
      .then(async (response) => {
        setLoading(false);
        if (response.error) {
          return;
        }

        //Set username and password in data store
        await storeData('username', JSON.stringify(data?.email));
        await storeData('password', JSON.stringify(data?.password));

        await storeData('first_name', JSON.stringify(response?.first_name));
        await storeData('last_name', JSON.stringify(response?.last_name));
        await storeData('email', JSON.stringify(response?.email));

        signIn(response);
        save('session', response);
      })
      .catch(error => {
        setLoading(false);
        console.error(error);
      });
    setLoading(false);
    // show error
  };

  // TODO: move this session validation logic to main routes
  // useEffect(() => {
  //   async function getValueFor(key: string) {
  //     const result = await SecureStore.getItemAsync(key);
  //     if (result) {
  //       await onLoginPress(JSON.parse(result));
  //     } else {
  //     }
  //   }
  //   getValueFor('session');
  // }, []);

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
            flex: 0.5,
          }}
        >
          <Image
            style={{ height: 230, width: 230, marginBottom: 20 }}
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
                      marginBottom: 16,
                    }}
                  >
                    <Controller
                      control={control}
                      render={({ onChange, onBlur, value }) => (
                        <HStack style={styles.loginInputContainer} space={2}>
                          <MaterialCommunityIcons
                            name="account-outline"
                            color="#24c38b"
                            size={24}
                          />
                          <TextInput
                            placeholder="Nom d'utilisateur"
                            style={{
                              flex: 1,
                            }}
                            onBlur={onBlur}
                            onChangeText={value => onChange(value)}
                            value={value}
                            autoCapitalize="none"
                          />
                        </HStack>
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
                        <HStack style={styles.loginInputContainer} space={2}>
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
                            size={24}
                          />
                          <TextInput
                            placeholder="Mot de passe"
                            style={{
                              flex: 1,
                            }}
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            secureTextEntry={isPasswordSecure}
                          />
                        </HStack>
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
                    alignSelf: 'center',
                    paddingHorizontal: 20,
                  }}
                  onPress={handleSubmit(onLoginPress)}
                >
                  <Text style={{ color: 'white' }}>SE CONNECTER</Text>
                </TouchableOpacity>
              )}
            </View>
            <View />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <TouchableOpacity
        onPress={() => navigation.navigate('StoreProjects')}
      >
        <Text style={{ color: 'green' }}>COSO Store</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL("https://gleeful-flan-aa2b5f.netlify.app/")}>
        <Text style={{ color: 'green' }}>Politique de confidentialité</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

export default Login;
