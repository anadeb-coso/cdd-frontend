import React, { useState, useRef } from 'react';
import { View, Button as ButtonNB } from 'native-base';
import { Text, StyleSheet, Alert, TouchableOpacity, Button as ButtonRN } from 'react-native';
import { Button } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import { DIAGNOSTIC_MAP_LATITUDE, DIAGNOSTIC_MAP_LONGITUDE, EXPO_MAPBOX_ACCESS_TOKEN } from '../../../services/env';
import { getBestLocation } from 'utils/functions_geolocation';

Mapbox.setAccessToken(EXPO_MAPBOX_ACCESS_TOKEN);

function TakePosition({ navigation, route }: { navigation: any, route: any }) {

    const { onTakeCoordinates, coordinates, editMap, widthContainer, heightContainer, widthMap, heightMap } = route.params;
    const multiCoordinates = route?.params?.multiCoordinates ?? null;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
            width: widthContainer ?? null,
            height: heightContainer ?? null,
        },
        map: {
            flex: 0.95,
            width: widthMap ?? '100%',
            height: heightMap ?? null,
        },
        // marker: {
        //     backgroundColor: 'red',
        //     padding: 5,
        //     borderRadius: 5,
        // },
        marker: {
            // backgroundColor: 'red',
            // padding: 5,
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
        },
        markerText: {
            // color: 'red',
            // fontSize: 30,
        },
        coordinatesContainer: {
            // // padding: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            borderRadius: 5,
        },
        container_coords_btn: {
            flex: 0.05,
            width: '100%',
            flexDirection: 'row',
        },
        container_coords: {
            flex: 0.4,
        },
        container_btn: {
            flex: 0.6,
        },
        btn: {
            backgroundColor: 'lightblue'
        },
        zoomControls: {
            position: 'absolute',
            bottom: 50,
            right: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 5,
            width: 45,
            // padding: 10,
        },
    });



    const cameraRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(6.4);
    const [clickedCoordinate, setClickedCoordinate]: any = useState(coordinates ?? null);


    const getCurrentLocation = async () => {
        let location = await getBestLocation();
        if (location) {
            const { latitude, longitude } = location.coords;
            setClickedCoordinate({ latitude, longitude });
        }
    };


    const handleZoomIn = () => {

        if (zoomLevel <= 13) {
            const newZoomLevel = zoomLevel + 1;
            setZoomLevel(newZoomLevel);
            if (cameraRef.current) {
                (cameraRef.current as any).setCamera({
                    zoom: newZoomLevel,
                    centerCoordinate: [clickedCoordinate?.longitude ?? DIAGNOSTIC_MAP_LONGITUDE, clickedCoordinate?.latitude ?? DIAGNOSTIC_MAP_LATITUDE],
                    animationDuration: 500,
                });
            }

        }

    };

    const handleZoomOut = () => {
        if (zoomLevel >= 2) {
            const newZoomLevel = zoomLevel - 1;
            setZoomLevel(newZoomLevel);
            if (cameraRef.current) {
                (cameraRef.current as any).setCamera({
                    zoom: newZoomLevel,
                    centerCoordinate: [clickedCoordinate?.longitude ?? DIAGNOSTIC_MAP_LONGITUDE, clickedCoordinate?.latitude ?? DIAGNOSTIC_MAP_LATITUDE],
                    animationDuration: 500,
                });
            }

        }
    };


    const handleMapPress = (event: any) => {
        if (editMap) {
            const { geometry } = event;
            const [longitude, latitude]: any = geometry.coordinates;
            setClickedCoordinate({ latitude, longitude });
        }

    };

    const handleAction = () => {

        onTakeCoordinates(clickedCoordinate);

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Mapbox.MapView
                style={styles.map}
                onPress={handleMapPress}
                requestDisallowInterceptTouchEvent
            >
                {/* Définir la caméra pour initialiser la vue de la carte */}
                <Mapbox.Camera
                    ref={cameraRef}
                    zoomLevel={zoomLevel}  // Vous pouvez ajuster le niveau de zoom
                    centerCoordinate={multiCoordinates ? (
                        multiCoordinates.length == 1 ? [multiCoordinates[0]?.longitude ?? DIAGNOSTIC_MAP_LONGITUDE, multiCoordinates[0]?.latitude ?? DIAGNOSTIC_MAP_LATITUDE] : [DIAGNOSTIC_MAP_LONGITUDE, DIAGNOSTIC_MAP_LATITUDE]
                    ) : [clickedCoordinate?.longitude ?? DIAGNOSTIC_MAP_LONGITUDE, clickedCoordinate?.latitude ?? DIAGNOSTIC_MAP_LATITUDE]}
                />
                
                {(multiCoordinates && multiCoordinates.length > 0) ? (
                    multiCoordinates.map((coord: any, index: number) => (
                        <Mapbox.PointAnnotation
                        id="clickedPoint"
                        key={`${index}.${coord?.longitude}.${coord?.latitude}`}
                        coordinate={[coord?.longitude, coord?.latitude]}
                    >
                        <View style={styles.marker}>
                            <FontAwesome style={styles.markerText} name="map-marker" size={zoomLevel ? zoomLevel * 2 : 9} color="red" />
                        </View>
                    </Mapbox.PointAnnotation>
                    ))
                ) : (clickedCoordinate && (
                    <Mapbox.PointAnnotation
                        id="clickedPoint"
                        coordinate={[clickedCoordinate?.longitude, clickedCoordinate?.latitude]}
                    >
                        <View style={styles.marker}>
                            <FontAwesome style={styles.markerText} name="map-marker" size={zoomLevel ? zoomLevel * 2 : 9} color="red" />
                        </View>
                    </Mapbox.PointAnnotation>
                ))}
            </Mapbox.MapView>
            <View style={styles.container_coords_btn}>
                {(multiCoordinates && multiCoordinates.length > 0) ? <></> : <View style={styles.container_coords}>
                    <View style={styles.coordinatesContainer}>
                        <Text>Latitude: {clickedCoordinate ? clickedCoordinate?.latitude : ' - '}</Text>
                        <Text>Longitude: {clickedCoordinate ? clickedCoordinate?.longitude : ' - '}</Text>
                    </View>
                </View>}
                {editMap && <View style={styles.container_btn}>
                    <Button
                        style={styles.btn}
                        onPress={() => {
                            handleAction();
                        }}
                    >Récupérer ces coordonnées</Button>
                </View>}
            </View>

            <View style={styles.zoomControls}>

                {editMap && <TouchableOpacity style={{ backgroundColor: 'blue', height: 50 }} onPress={getCurrentLocation}><Text style={{ margin: 'auto', marginBottom: 15, color: 'white', fontWeight: 'bold', fontSize: 30 }}>.</Text></TouchableOpacity>}

                <ButtonNB backgroundColor={'white'} onPress={handleZoomIn} ><Text style={{ color: 'black' }}>+</Text></ButtonNB>
                <ButtonNB backgroundColor={'white'} onPress={handleZoomOut} ><Text style={{ color: 'black' }}>-</Text></ButtonNB>
            </View>

        </View>
    )
}



export default TakePosition;