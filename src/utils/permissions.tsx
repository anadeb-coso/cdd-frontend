
import { PermissionsAndroid, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import i18n from '../translations/i18n';

const t = (key: string, options?: any): string => i18n.t(key, { ns: 'utils', ...options }) as string;

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
                    title: t('storage_permission_title'),
                    message: t('storage_permission_message'),
                    buttonNeutral: t('ask_later_button'),
                    buttonNegative: t('cancel_button'),
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
                alert(t('media_library_permission_needed'));
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
                alert(t('camera_permission_needed'));
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
                        title: t('camera_permission_title'),
                        message: t('camera_permission_message'),
                        buttonNeutral: t('ask_later_button'),
                        buttonNegative: t('cancel_button'),
                        buttonPositive: 'OK'
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    alert(t('camera_permission_denied'));
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


export async function requestGeolocationPermissions() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      ]);
  
      if (
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("Permissions de localisation accordées.");
      } else {
        console.log("Permissions de localisation refusées.");
      }
    } catch (err) {
      console.warn(err);
    }
  }

export async function requestMediaPermissions() {
    try {
        if (Platform.OS === 'android') {
            const grantedCamera = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: t('camera_permission_title'),
                    message: t('camera_permission_photos_message'),
                    buttonNeutral: t('ask_later_button'),
                    buttonNegative: t('cancel_button'),
                    buttonPositive: 'OK',
                }
            );

            const grantedStorage = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: t('storage_permission_title'),
                    message: t('storage_permission_photos_message'),
                    buttonNeutral: t('ask_later_button'),
                    buttonNegative: t('cancel_button'),
                    buttonPositive: 'OK',
                }
            );

            // const grantedPackage = await PermissionsAndroid.request(
            //     PermissionsAndroid.PERMISSIONS.REQUEST_INSTALL_PACKAGES,
            //     {
            //         title: "Package Permission",
            //         message: "This app needs access to your Package to save photos.",
            //         buttonNeutral: "Ask Me Later",
            //         buttonNegative: "Cancel",
            //         buttonPositive: "OK",
            //     }
            // );

            const grantedLocation = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: t('location_permission_title'),
                    message: t('location_permission_current_position_message'),
                    buttonNeutral: t('ask_later_button'),
                    buttonNegative: t('cancel_button'),
                    buttonPositive: 'OK',
                }
            );

            const grantedCoarseLocation = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                {
                    title: t('coarse_location_permission_title'),
                    message: t('coarse_location_permission_message'),
                    buttonNeutral: t('ask_later_button'),
                    buttonNegative: t('cancel_button'),
                    buttonPositive: 'OK',
                }
            );

            const grantedBackgroungLocation = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                {
                    title: t('background_location_permission_title'),
                    message: t('background_location_permission_message'),
                    buttonNeutral: t('ask_later_button'),
                    buttonNegative: t('cancel_button'),
                    buttonPositive: 'OK',
                }
            );

            if (
                grantedCamera === PermissionsAndroid.RESULTS.GRANTED && 
                grantedStorage === PermissionsAndroid.RESULTS.GRANTED && 
                // grantedPackage === PermissionsAndroid.RESULTS.GRANTED && 
                grantedBackgroungLocation === PermissionsAndroid.RESULTS.GRANTED && 
                grantedLocation === PermissionsAndroid.RESULTS.GRANTED
            ) {
                console.log("You can use the camera and storage");
            } else {
                console.log("Permission denied");
            }
        }
    } catch (err) {
        console.warn(err);
    }
}

export async function requestMediaLibraryCameraPermissionsAsync() {
    requestCameraPermissionsAsync();
    requestMediaLibraryPermissionsAsync();
}