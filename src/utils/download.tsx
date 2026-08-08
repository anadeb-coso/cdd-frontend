import * as FileSystem from 'expo-file-system';
import { download } from '../services/download';
import moment from 'moment';
import RNFS from 'react-native-fs';
import { Alert, Platform } from 'react-native';
import { requestWritePermission } from './permissions';
import i18n from '../translations/i18n';

const t = (key: string, options?: any): string => i18n.t(key, { ns: 'utils', ...options }) as string;
const tc = (key: string, options?: any): string => i18n.t(key, { ns: 'common', ...options }) as string;

// export const downloadFile = async (fileUri: any="https://cddfiles.s3.amazonaws.com/Manuel_depoiement.pdf") => {
  export const downloadFile = async (fileUri: any, install_apk=false) => {

    let fileName = fileUri.split('/')[fileUri.split('/').length-1]
    // const fileDest = `${FileSystem.documentDirectory}${fileName}`;
    await download(fileUri, `${fileName.split('.')[0]}_${moment().format('YYYY-MM-DD HH:mm:ss.SSS').replace(/[-T:+]/g, '_')}.${fileName.split('.').pop()}`, install_apk);

    // try {
    //   const downloadObject = FileSystem.createDownloadResumable(fileUri, fileDest);

    //   const { uri, status }: any = await downloadObject.downloadAsync();

    //   console.log('File downloaded tosdfsdf dsfds:', uri);
    //   if (status === 200) {
    //     // Move the file to the Downloads folder
    //     const destinationUri = `${FileSystem.documentDirectory}Download/${fileName}`;
    //     console.log(destinationUri)
    //     await FileSystem.moveAsync({ from: uri, to: destinationUri });

    //     // Open the share dialog
    //     await Sharing.shareAsync(destinationUri);
    //   }else {
    //     console.error('Error downloading file. HTTP status:', status);
    //   }

      
    //   return true;
    // } catch (error) {
    //   console.error('Error downloading file:', error);
    // }

    return false;
  };


  export const download_file = async (uri: any) => {
    const hasPermission = await requestWritePermission();
    if (!hasPermission) {
        Alert.alert(tc('error'), t('permissions_not_granted'));
        return;
    }
    uri = uri.split('?')[0];
    const fileName = `${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}_${uri.split('/')[uri.split('/').length - 1]}`;

    const downloadDest = Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

    try {
        const download = RNFS.downloadFile({
            fromUrl: uri,
            toFile: downloadDest,
        });

        const result = await download.promise;

        if (result.statusCode === 200) {
            Alert.alert(tc('success'), t('file_downloaded_to_downloads_folder'));
        } else {
            Alert.alert(tc('error'), t('image_download_failed'));
        }
    } catch (error) {
        Alert.alert(tc('error'), t('image_download_error'));
        console.error(error);
    }
};
