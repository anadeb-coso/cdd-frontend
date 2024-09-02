
import { PermissionsAndroid, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export async function requestWriteANdInstallPermissions() {
    try {
        const permissions = [
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            // PermissionsAndroid.PERMISSIONS.REQUEST_INSTALL_PACKAGES,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        const writeGranted = granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
        // const installGranted = granted[PermissionsAndroid.PERMISSIONS.REQUEST_INSTALL_PACKAGES] === PermissionsAndroid.RESULTS.GRANTED;

        return writeGranted;// && installGranted;
    } catch (err) {
        console.warn(err);
        return false;
    }
}

export async function requestWritePermission() {
    try {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Permission de stockage nécessaire',
                    message: 'Cette application a besoin de l\'accès au stockage pour télécharger des fichiers.',
                    buttonNeutral: 'Demander plus tard',
                    buttonNegative: 'Annuler',
                    buttonPositive: 'OK',
                }
            );
            // const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    } catch (err) {
        console.warn(err);
        return false;
    }
}

export async function requestMediaLibraryPermissionsAsync() {
    if (Platform.OS !== 'web') {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        }
    }
}

export async function requestCameraPermissionsAsync() {
    if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        }
    }
}