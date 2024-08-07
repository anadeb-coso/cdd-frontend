import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewComponent = ({ navigation, route }: { navigation: any; route: any; }) => {
    const { uri } = route.params;
    
    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: uri }}
                style={styles.webview}
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

export default WebViewComponent;
