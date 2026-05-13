import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import * as Location from 'expo-location';
import GeolocationsAPI from '../../services/planning/geolocations';
import { isWithinRadius } from '../../utils/functions';
// import { requestMediaPermissions } from '../../utils/permissions';
// import { covered_location } from '../../utils/functions_native';
import { getBestLocation } from 'utils/functions_geolocation';

moment.locale('fr');

const LocationPosition = ({
    location, setLocation, accuracy, setAccuracy, error, setError,
    takingDate, setTakingDate, title, btnTitle, save, setSuccessSaved, activity,
    currentGeolocationEnding, setCurrentGeolocationEnding, setGeolocations,
    currentGeolocation, setCurrentGeolocation,
    selectedDate, get_tasks_planned,
    showDetails,
    setLoading,
}: {
    location?: any;
    setLocation: (i: any) => void;
    accuracy?: any;
    setAccuracy: (i: any) => void;
    error?: any;
    setError: (i: any) => void;
    takingDate?: any;
    setTakingDate: (i: any) => void;
    title?: any;
    btnTitle?: any;
    save?: boolean;
    setSuccessSaved: (i: boolean) => void;
    activity?: any;
    currentGeolocationEnding?: any;
    setCurrentGeolocationEnding: (i: any) => void;
    setGeolocations: (i: any) => void;
    currentGeolocation?: any;
    setCurrentGeolocation: (i: any) => void;
    selectedDate?: any;
    get_tasks_planned: () => void;
    showDetails?: boolean;
    setLoading: (i: any) => void;
}) => {
    let radius = 5;
    const [takingCoords, setTakingCoords]: any = useState(false);

    const after_get_coords = async (pos: any) => {
        setLocation(pos.coords);
        setError(null);
        let datetime = moment();
        setTakingDate(datetime);

        if (save && activity) {
            let g = [];
            let ok = true;
            if (currentGeolocationEnding) {
                g = [{
                    ...currentGeolocationEnding,
                    latitude_end: pos.coords.latitude,
                    longitude_end: pos.coords.longitude,
                    taking_datetime_end: datetime,
                    geolocation_end: pos
                }];
                if (!isWithinRadius(
                    currentGeolocationEnding.latitude_start, currentGeolocationEnding.longitude_start,
                    pos.coords.latitude, pos.coords.longitude,
                    radius
                )) {
                    ok = false;
                }
            } else {
                g = [{
                    activity: activity?.id ?? activity,
                    latitude_start: pos.coords.latitude,
                    longitude_start: pos.coords.longitude,
                    taking_datetime_start: datetime,
                    geolocation_start: pos,
                    planning_date: selectedDate
                }]
            }
            if (ok) {
                setLoading(true);
                await new GeolocationsAPI().save_geolocations(g)
                    .then((r: any) => {
                        setLoading(false);
                        setGeolocations(r);
                        setCurrentGeolocationEnding(r.find((g: any) => g.planning_date == selectedDate && g?.latitude_start && !g?.latitude_end));
                        setCurrentGeolocation(r.find((g: any) => g.planning_date == selectedDate && g?.latitude_start));
                        setSuccessSaved(true);
                        get_tasks_planned();
                    })
                    .catch((e: any) => {
                        setSuccessSaved(false);
                        setLoading(false);
                    })
            } else {
                Alert.alert(
                    "Alert", `Vous devez être au moins dans un rayon de ${radius} kilomètre${radius > 1 ? 's' : ''} du point d'arrivée (L'endroit où vous vous trouviez avant de cliquer sur le bouton "Je suis arrivé(e)")`, [
                    {
                        text: "ok", onPress: async () => {

                        }
                    }
                ]);
                setTakingCoords(false);
            }

        } else {
            setTakingCoords(false);
        }
    };


    const getBestLocationLocal = async () => {
        setTakingCoords(true);
        let location = await getBestLocation(); 
        if (location){
            after_get_coords(location);
        }else{
            Alert.alert(
                "Alert", `Permission to access location was denied`, [
                {
                    text: "ok", onPress: async () => {

                    }
                }
            ]);
        }
        setTakingCoords(false);

    };


    return (
        <View style={styles.container}>

            {showDetails && <>{location ? (
                <View>
                    <Text style={styles.title}>{title ? title : 'Localisation Précise'}</Text>
                    <View>
                        <Text>Latitude: {location.latitude}</Text>
                        <Text>Longitude: {location.longitude}</Text>
                        <Text>Précision: {location.accuracy ? `${location.accuracy.toFixed(2)} mètres` : 'N/A'}</Text>
                        <Text>Date et Heure: {takingDate ? moment(takingDate).format('dddd DD, MMMM YYYY à HH:mm') : 'N/A'}</Text>

                    </View>
                </View>
            ) : (
                // <Text>Auncune information disponible</Text>
                <Text>{" "}</Text>
            )}</>}
            {error && <Text style={styles.error}>Erreur: {error} {(error.includes("No location provider available")) ? `veuillez recliquer sur "${btnTitle ? btnTitle : 'Obtenir votre Position'}" pour relancer.` : ""}</Text>}
            {takingCoords && <Text style={{ color: 'purple' }}>Récupération en cours...
                {/* si la récupération prend du temps, veuillez recliquer sur le "{btnTitle ? btnTitle : "Obtenir votre Position"}" pour relancer. */}
            </Text>}
            <Button disabled={takingCoords} title={btnTitle ? btnTitle : "Obtenir votre Position"} onPress={() => {
                if (!takingCoords) {
                    getBestLocationLocal();
                } else {
                    Alert.alert(
                        "Alert", `En cours de récupération...`, [
                        { text: "Ok", onPress: async () => { } }
                    ]);
                }
            }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        marginBottom: 11,
    },
    error: {
        color: 'red',
    },
});

export default LocationPosition;
