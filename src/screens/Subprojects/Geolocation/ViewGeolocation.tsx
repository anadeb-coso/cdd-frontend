import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'native-base';
import { RefreshControl, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';

import TakePosition from '../../News/AddNews/TakePosition';

import { Layout } from '../../../components/common/Layout';
import { PrivateStackParamList } from '../../../types/navigation';
import { colors } from '../../../utils/colors';
import { DIAGNOSTIC_MAP_LATITUDE, DIAGNOSTIC_MAP_LONGITUDE } from '../../../services/env';

const theme = {
    roundness: 12,
    colors: {
        ...colors,
        background: 'white',
        placeholder: '#dedede',
        text: '#707070',
    },
};

function ViewGeolocation({ route, locationData = [], width = '100%', height = 500, abilityRefresh = false }: { route: any; locationData: any; width: any; height: any; abilityRefresh?: boolean }) {
    const { t } = useTranslation('common');
    const [mapLat, setMapLat] = useState(locationData.length > 0 ? Number(locationData[0].latitude) : DIAGNOSTIC_MAP_LATITUDE);
    const [mapLong, setMapLong] = useState(locationData.length > 0 ? Number(locationData[0].longitude) : DIAGNOSTIC_MAP_LONGITUDE);

    locationData = route.params.locationData ?? locationData;
    width = route.params.width ?? width;
    height = route.params.height ?? height;

    const navigation =
        useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(t('no_internet'));
    const [connected, setConnected] = useState(true);
    const [errorVisible, setErrorVisible] = React.useState(false);
    const onDismissSnackBar = () => setErrorVisible(false);

    const check_network = async () => {
        NetInfo.fetch().then((state) => {
            if (!state.isConnected) {
                setErrorMessage(t('no_network'));
                setErrorVisible(true);
                setConnected(false);
            }else if(!state.isInternetReachable){
                setErrorMessage(t('no_internet'));
                setErrorVisible(true);
                setConnected(false);
            }
        });
    }


    useEffect(() => {

    }, []);



    const onRefresh = async () => {
        setRefreshing(true);
        setConnected(true);
        await check_network();


        setRefreshing(false);
    };


    if (refreshing) {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#24c38b" />
                </View>
                <Snackbar visible={errorVisible} duration={3000} onDismiss={onDismissSnackBar}>
                    {errorMessage}
                </Snackbar>
            </View>
        );
    }




    const styles = StyleSheet.create({
        text_title: {
            fontSize: 16,
            // fontFamily: "body",
            fontWeight: 'bold',
            color: "black",
        },
        container: {
            flex: 1,
        },
        map: {
            width: width,
            height: height,
        },
    });

    return (
        <Layout disablePadding>
            {/* <ScrollView _contentContainerStyle={{ pt: 7, px: 5 }}
                refreshControl={
                    abilityRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
                }>
                <View style={styles.container}>
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        zoomEnabled={true}
                        zoomControlEnabled={true}
                        zoomTapEnabled={true}
                        // minZoomLevel={6.29}
                        initialRegion={{
                            latitude: mapLat,
                            longitude: mapLong,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,

                        }}
                    >
                        {locationData && locationData.map((data: any, index: number) => (
                            <Marker
                                key={index}
                                coordinate={{
                                    latitude: Number(data.latitude),
                                    longitude: Number(data.longitude),
                                }}
                                title={`Marker ${index + 1}`}
                                description={`Weight: ${data.weight}`}
                            />
                        ))}
                    </MapView>
                </View>

            </ScrollView> */}




            {locationData && locationData.length > 0 && <View style={{ marginVertical: 11 }}>
                {
                    <TakePosition key={`view_map`} navigation={null} route={{
                        params: {
                            multiCoordinates: [...locationData.map((data: any) => ({
                                latitude: Number(data.latitude),
                                longitude: Number(data.longitude),
                            }))],
                            heightContainer: 650,
                            heightMap: 650,
                        }
                    }} />
                }
            </View>}

        </Layout>
    );



}

export default ViewGeolocation;
