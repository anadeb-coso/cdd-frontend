import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { useToast } from 'native-base';
import { useTranslation } from 'react-i18next';
import { cddBaseURL } from '../services/env';

const PasswordLoss = ({ navigation }: { navigation: any }) => {
    const { t } = useTranslation(['core', 'common']);
    const webViewRef: any = useRef(null);
    var toast = useToast();

    const handleNavigationChange = (navState: any) => {
        if (navState.url && navState.url.includes('/reset-password-done')) {
            toast.show({
                description: t('password_loss.reset_success_toast'),
              });
            navigation.goBack();
        }
    };


    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                source={{ uri: `${cddBaseURL}reset-password-ask-email/` }}
                style={styles.webview}
                onNavigationStateChange={handleNavigationChange}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
    },
});

export default PasswordLoss;
