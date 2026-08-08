import { Linking, Platform, Alert } from 'react-native';
import i18n from '../translations/i18n';


export function installAPK(apkPath: any) {
    if (Platform.OS === 'android') {
        Linking.openURL(`file://${apkPath}`)
            .catch(err => {
                Alert.alert(i18n.t('alert', { ns: 'common' }) as string, i18n.t('apk_open_install_error', { ns: 'utils' }) as string);
                console.error(err);
            });
    } else {
        Alert.alert(i18n.t('alert', { ns: 'common' }) as string, i18n.t('apk_android_only_error', { ns: 'utils' }) as string);
    }
}
