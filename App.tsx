import 'react-native-gesture-handler';
import { NativeBaseProvider } from 'native-base';
// import { Provider } from 'react-redux';
// import { store } from 'store';
import { config, theme } from 'utils/nativeBase';
import React from 'react';
import MainApp from './src/navigation/main';
// import 'utils/i18n.config';

if (__DEV__) {
  import('utils/reactotronConfig').then(() =>
    console.log('Reactotron Configured'),
  );
}

export default function App() {
  return (
    <NativeBaseProvider theme={theme} config={config}>
      <MainApp />
    </NativeBaseProvider>
  );
}
