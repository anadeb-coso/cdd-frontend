
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
    try {
        if (Platform.OS !== 'web') {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
            return true;
        }
    } catch (err) {
        console.warn(err);
    }
    return false;

}

export async function requestCameraPermissionsAsync() {
    try {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
            }
            return true;
        }
    } catch (err) {
        console.warn(err);
    }
    return false;
}

export const requestCameraPermission = async () => {
    try {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "Camera Permission",
                        message:
                            "App needs camera permission",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    alert('Camera permission denied');
                }
                return true;
            } catch (err) {
                console.warn(err);
            }
        }
    } catch (err) {
        console.warn(err);
    }
    return false;
};
