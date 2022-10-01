import Reactotron from 'reactotron-react-native';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let scriptHostname;
if (__DEV__) {
  const scriptURL = NativeModules.SourceCode.scriptURL;
  scriptHostname = scriptURL.split('://')[1].split(':')[0];
}

if (Reactotron.setAsyncStorageHandler)
  Reactotron.setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
    .configure()
    .useReactNative({
      networking: {
        // optionally, you can turn it off with false.
        ignoreUrls: /symbolicate/,
      },
      editor: false, // there are more options to editor
      errors: { veto: stackFrame => false }, // or turn it off with false
      overlay: false, // just turning off overlay
    })
    .connect();
