import { Linking, Platform, Alert } from 'react-native';


export function installAPK(apkPath: any) {
    if (Platform.OS === 'android') {
        Linking.openURL(`file://${apkPath}`)
            .catch(err => {
                Alert.alert('Erreur', 'Impossible d\'ouvrir l\'APK pour l\'installation');
                console.error(err);
            });
    } else {
        Alert.alert('Erreur', 'L\'installation automatique n\'est disponible que sur Android');
    }
}
