import * as FileSystem from 'expo-file-system';
import * as Sharing from "expo-sharing";
import { Platform, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import { openAPK } from '../components/ReadFile/FileComponent';
import { requestWriteANdInstallPermissions } from '../utils/permissions';
import { installAPK } from './installAPK';
import i18n from '../translations/i18n';

const t = (key: string): string => i18n.t(key, { ns: 'utils' }) as string;
const tc = (key: string): string => i18n.t(key, { ns: 'common' }) as string;


async function saveFile(uri: any, filename: any, mimetype: any) {
    if (Platform.OS === "android") {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

            await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
                .then(async (uri: any) => {
                    await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
                })
                .catch((e: any) => console.log(e));
        } else {
            Sharing.shareAsync(uri);
        }
    } else {
        Sharing.shareAsync(uri);
    }
}



export async function download(uri: any, filename: string, install_apk=false) {


    const result = await FileSystem.downloadAsync(
        uri,
        FileSystem.documentDirectory + filename
    );
    if(install_apk){
        //Install APK
        
        openAPK(result.uri);
        // await downloadAndInstallAPK(uri);
    }else{
        

        // Save the downloaded file
        saveFile(result.uri, filename, result.headers["Content-Type"]);
    }
    
}



async function downloadAndInstallAPK(uri: any) {
    const hasPermission = await requestWriteANdInstallPermissions();
    if (!hasPermission) {
        Alert.alert(tc('error'), t('permissions_not_granted'));
        return;
    }

    const fileName = `${uri.split('?')[0].split('/')[uri.split('?')[0].split('/').length-1]}`;

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
            Alert.alert(tc('success'), t('apk_download_success'));
            installAPK(downloadDest);
        } else {
            Alert.alert(tc('error'), t('apk_download_failed'));
        }
    } catch (error) {
        Alert.alert(tc('error'), t('apk_download_error'));
        console.error(error);
    }
}