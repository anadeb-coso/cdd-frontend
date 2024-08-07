import * as FileSystem from 'expo-file-system';
import * as Sharing from "expo-sharing";
import { Platform } from 'react-native';
import { openAPK } from '../components/ReadFile/FileComponent';


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

    // Log the download result
    // console.log(result);
    if(install_apk){
        //Install APK
        // console.log(result.uri);
        openAPK(result.uri);
    }else{
        // Save the downloaded file
        saveFile(result.uri, filename, result.headers["Content-Type"]);
    }
    
}