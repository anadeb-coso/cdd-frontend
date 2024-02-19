import React from 'react';
import {
    View, Image
} from 'react-native';

export const showImage = (_uri: string, width: number | string, height: number | string) => {
    if (_uri) {
        let uri = _uri.toLowerCase();
        if (uri.includes(".pdf")) {
            return (
                <View>
                    <Image
                        resizeMode="stretch"
                        style={{ width: width, height: height, borderRadius: 10 }}
                        source={require('../../assets/illustrations/pdf.png')}
                    />
                </View>
            );
        } else if (uri.includes(".docx") || uri.includes(".doc")) {
            return (
                <View>
                    <Image
                        resizeMode="stretch"
                        style={{ width: width, height: height, borderRadius: 10 }}
                        source={require('../../assets/illustrations/docx.png')}
                    />
                </View>
            );
        } else if (uri.includes(".mp4") || uri.includes(".webm") || uri.includes(".gif")) {
            return (
                <View>
                    <Image
                        resizeMode="stretch"
                        style={{ width: width, height: height, borderRadius: 10 }}
                        source={require('../../assets/illustrations/video.png')}
                    />
                </View>
            );
        }
    }
    return (
        <View>
            <Image
                resizeMode="stretch"
                style={{ width: width, height: height, borderRadius: 10 }}
                source={require('../../assets/illustrations/file.png')}
            />
        </View>
    );
}