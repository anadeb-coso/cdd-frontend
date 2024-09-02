import React, { useEffect, useState, useRef } from 'react';
import { Heading, HStack, Pressable, ScrollView, View, useToast } from 'native-base';
import { Platform, Text, StyleSheet, Alert, TouchableOpacity, Button as ButtonRN, Image, PermissionsAndroid } from 'react-native';
import { ActivityIndicator, Snackbar, TextInput, Checkbox, Button } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import Geolocation from '@react-native-community/geolocation';
import { DIAGNOSTIC_MAP_LATITUDE, DIAGNOSTIC_MAP_LONGITUDE, EXPO_MAPBOX_ACCESS_TOKEN } from '../../../services/env';

Mapbox.setAccessToken(EXPO_MAPBOX_ACCESS_TOKEN);

function TakePosition({ navigation, route }: { navigation: any, route: any }) {
    console.log(7777)
    const { onTakeCoordinates, coordinates, editMap, widthContainer, heightContainer, widthMap, heightMap } = route.params;
    console.log(coordinates)
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
            // padding: 10,
        },
    });



    const cameraRef = useRef(null);
    const [zoomLevel, setZoomLevel] = useState(6.4);
    const [clickedCoordinate, setClickedCoordinate]: any = useState(coordinates ?? null);
    console.log(clickedCoordinate)
    const [myLocation, setMyLocation]: any = useState(null);

    useEffect(() => {
        if (Platform.OS === 'android') {
          requestLocationPermission();
        }
      }, []);

      const requestLocationPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "App Location Permission",
              message: "We need access to your location to show your current position.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
          } else {
            console.log("Location permission denied");
            return false;
          }
        } catch (err) {
          console.warn(err);
          return false;
        }
      };

      const getCurrentLocation = async () => {
        if(await requestLocationPermission()){
            Geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  setClickedCoordinate({ latitude, longitude });
                },
                (error) => {
                  console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
              );
        }else{
            Alert.alert('Warning', "Veuillez autoriser la prise de vos coordonnées dans les paramètres", [{ text: 'OK' }], {
                cancelable: false,
            });
        }
        
      };

    const handleZoomIn = () => {
        console.log(zoomLevel)
        if(zoomLevel <= 13){
            const newZoomLevel = zoomLevel + 1;
            setZoomLevel(newZoomLevel);
    
            cameraRef.current.setCamera({
                zoom: newZoomLevel,
                centerCoordinate: [clickedCoordinate?.longitude ?? DIAGNOSTIC_MAP_LONGITUDE, clickedCoordinate?.latitude ?? DIAGNOSTIC_MAP_LATITUDE],
                animationDuration: 500,
            });
        }
        
    };

    const handleZoomOut = () => {
        console.log(zoomLevel)
        if(zoomLevel >= 2){
            const newZoomLevel = zoomLevel - 1;
            setZoomLevel(newZoomLevel);
            cameraRef.current.setCamera({
                zoom: newZoomLevel,
                centerCoordinate: [clickedCoordinate?.longitude ?? DIAGNOSTIC_MAP_LONGITUDE, clickedCoordinate?.latitude ?? DIAGNOSTIC_MAP_LATITUDE],
                animationDuration: 500,
            });
        }
    };


    const handleMapPress = (event: any) => {
        if(editMap){
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
            <Mapbox.MapView style={styles.map} onPress={handleMapPress}>
                {/* Définir la caméra pour initialiser la vue de la carte */}
                <Mapbox.Camera
                    ref={cameraRef}
                    zoomLevel={zoomLevel}  // Vous pouvez ajuster le niveau de zoom
                    centerCoordinate={[clickedCoordinate?.longitude ?? DIAGNOSTIC_MAP_LONGITUDE, clickedCoordinate?.latitude ?? DIAGNOSTIC_MAP_LATITUDE]}
                />
                {/* Ajouter des marqueurs pour chaque point de données */}
                {/* {locationData && locationData.map((data, index) => (
                    <Mapbox.PointAnnotation
                        key={`marker-${index}`}
                        id={`marker-${index}`}
                        coordinate={[Number(data.longitude), Number(data.latitude)]}
                        title={`Marker ${index + 1}`}
                    > */}
                {/* Vous pouvez ajouter une vue personnalisée pour le marqueur ici si nécessaire */}
                {/* <View style={styles.marker}>
                            <Mapbox.Callout title={`Weight: ${data.weight}`} />
                        </View>
                    </Mapbox.PointAnnotation>
                ))} */}
                {/* <Mapbox.PointAnnotation
                    key={`marker-`}
                    id={`marker-`}
                    coordinate={[Number(-0.127015), Number(11.130825)]}
                    title={`Marker`}
                > */}
                {/* Vous pouvez ajouter une vue personnalisée pour le marqueur ici si nécessaire */}
                {/* <View style={styles.marker}>
                        <Mapbox.Callout title={`Weight: `} />
                    </View>
                </Mapbox.PointAnnotation> */}

                            {/* <Image
                            resizeMode="stretch"
                            style={{ width: zoomLevel ? 5*zoomLevel : 20, height: zoomLevel ? 5*zoomLevel : 20, borderRadius: 50 }}
                            source={require('../../../../assets/illustrations/fire_crash.jpg')}
                          /> */}
                {clickedCoordinate && (
                    <Mapbox.PointAnnotation
                        id="clickedPoint"
                        coordinate={[clickedCoordinate.longitude, clickedCoordinate.latitude]}
                    >
                        <View style={styles.marker}>
                            <FontAwesome style={styles.markerText} name="map-marker" size={zoomLevel ? zoomLevel*5 : 20} color="red" />
                        </View>
                    </Mapbox.PointAnnotation>
                )}
            </Mapbox.MapView>
            <View style={styles.container_coords_btn}>
                <View style={styles.container_coords}>
                    <View style={styles.coordinatesContainer}>
                        <Text>Latitude: {clickedCoordinate ? clickedCoordinate.latitude : ' - '}</Text>
                        <Text>Longitude: {clickedCoordinate ? clickedCoordinate.longitude : ' - '}</Text>
                    </View>
                </View>
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
                
                {editMap && <ButtonRN title='.' color={'blue'} onPress={getCurrentLocation} />}

                <ButtonRN title='+' color={'black'} onPress={handleZoomIn} />
                <ButtonRN title='-' color={'black'} onPress={handleZoomOut} />
            </View>

        </View>
    )
}



export default TakePosition;