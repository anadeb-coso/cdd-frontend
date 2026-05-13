// import * as RNGeolocation from 'react-native-geolocation-service';
import Geolocation from 'react-native-geolocation-service';
import * as CGeolocation from '@react-native-community/geolocation';
import * as Location from 'expo-location';
import { Alert, Platform, ToastAndroid } from 'react-native'; 

const requestPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert(
            "Autorisation requise", 
            "Veuillez accorder l'autorisation de localisation pour utiliser cette fonctionnalité.", 
            [{ text: "OK" }]
        );
        return false;
    }
    return true;
};

const getRNGeolocation = () => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (error) => reject(error),
            { 
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
                forceRequestLocation: true
            }
        );
    });
};

const getCommunityGeolocation = () => {
    return new Promise((resolve, reject) => {
                
        CGeolocation.default.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => reject(err),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0, 
            }
        );
    });
};

const getExpoLocation = async () => {
    return await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest
    });
};

const toast = (position: any, type: string) => {
    if (position && position.coords && position.coords.accuracy){
        ToastAndroid.show(`${type}. Précision ${position.coords.accuracy} ${position.coords.accuracy >= 2 ? "mètres" : "mètre"}`, ToastAndroid.SHORT);
    }
};

// /**
//  * Récupère un objet dynamique
//  * @returns {Promise<Record<string, *>>}  // dictionnaire<string, any> dans une Promise
//  */
export const getBestLocation = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
        return null;
    }

    try {
        const position = await getRNGeolocation();
        toast(position, 'RNGS');
        if (position) return Object(position);
    } catch (e) {
        console.warn("RNGeolocation a échoué. Tentative avec @community...");
    }

    try {
        if (Platform.OS === 'ios') {
            const auth = await new Promise((resolve) => {
                CGeolocation.default.requestAuthorization(
                () => resolve('granted'),
                () => resolve('denied')
                );
            });
            
            if (auth !== 'granted') {
                return await getExpoLocation();
            }
        }
        const position = await getCommunityGeolocation();
        toast(position, 'RNCG');
        if (position) return Object(position);
    } catch (e) {
        console.warn("@community/geolocation a échoué. Tentative avec Expo...");
    }

    try {
        const position = await getExpoLocation();
        toast(position, 'EL');
        if (position) return Object(position);
    } catch (e) {
        console.warn("Toutes les tentatives de géolocalisation ont échoué.", e);
        Alert.alert(
            "Information", 
            "Nous n'arrivons pas à avoir votre position. Veuillez réessayer plus tard.", 
            [{ text: "OK" }]
        );
    }
    
    return null;
};