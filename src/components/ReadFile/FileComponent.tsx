import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';

export const openPDF = async (localUri: any) => {
    try {
      await IntentLauncher.startActivityAsync(
        'android.settings.ACTION_VIEW',
        {
          data: localUri,
          type: 'application/pdf',
          packageName: 'com.google.android.apps.docs'
        }
      );
    } catch (error) {
      console.error('Error opening PDF:', error);
    }
  };

  export const openAPK = async (localUri: any) => {
    // try{
      console.log(localUri)
      localUri = await FileSystem.getContentUriAsync(localUri);
      console.log(localUri)
      await IntentLauncher.startActivityAsync(
        "android.intent.action.INSTALL_PACKAGE",
        {
          data: localUri,
          type: 'application/vnd.android.package-archive'
        }
      );
      console.log('APK installation successful!');
      // try {
      //   await IntentLauncher.startActivityAsync(
      //     "android.intent.action.INSTALL_PACKAGE",
      //     {
      //       data: localUri,
      //       type: 'application/vnd.android.package-archive',
      //       flags: 1
      //     }
      //   );
      // } catch (error) {
      //   console.error('Error opening APK:', error);
      // }

    // } catch (error) {
    //   console.error('Error content APK:', error);
    // }
  };


const PdfComponent = (uri: string) => {
  return (
    <View style={styles.container}>
      <Pdf
        style={styles.pdf}
        source={{ uri: uri, cache: true }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
//   container: {
//     flex: 1,
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     marginTop: 25,
// },
// pdf: {
//     flex:1,
//     width:Dimensions.get('window').width,
//     height:Dimensions.get('window').height,
// }
});

export default PdfComponent;
