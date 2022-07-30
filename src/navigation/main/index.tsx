/* eslint-disable camelcase */
import { NavigationContainer } from '@react-navigation/native';
import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { Text } from 'native-base';
import {
  useFonts,
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import Routes from './routes';
import { AuthProvider } from '../../contexts/auth';

export default function MainApp() {
  LogBox.ignoreLogs(['contrast ratio']);
  LogBox.ignoreLogs(['Remote debugger']);
  LogBox.ignoreLogs(['Please pass alt prop to Image component']);
  LogBox.ignoreLogs(['Constants.platform.ios.model']);
  LogBox.ignoreLogs(['When server rendering']);
  LogBox.ignoreLogs(['Reanimated 2']);
  const [isReady, _setIsReady] = useState(false);

  // const [logIn] = useLoginMutation();

  // TODO: get token from store
  const [token, setToken] = useState();
  const [fontsLoaded] = useFonts({
    Poppins_100Thin,
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });
  // const { token, isAuthenticated } = useAppSelector(state => state.auth);

  useLayoutEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      // if (!isAuthenticated) {
      //   const credentials = await SecureStore.getItemAsync('credentials');
      //   if (credentials) {
      //     await logIn(JSON.parse(credentials)).unwrap();
      //   }
      // }
      _setIsReady(true);
    })();
  }, [token]);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady || !fontsLoaded) {
    return null;
  }


  return (
    <SafeAreaProvider>
      <NavigationContainer
        fallback={<Text>Loading...</Text>}
        onReady={onLayoutRootView}
      >
        <AuthProvider>
          <Routes />
        </AuthProvider>
        {/* {isAuthenticated ? <MainDrawerRouter /> : <AuthRouter />} */}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
