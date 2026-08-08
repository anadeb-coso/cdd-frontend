import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Button, TextInput, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import moment from 'moment';
import * as Location from 'expo-location';
import GeolocationsAPI from '../../services/planning/geolocations';
import { isWithinRadius } from '../../utils/functions';
// import { requestMediaPermissions } from '../../utils/permissions';
// import { covered_location } from '../../utils/functions_native';
import { getBestLocation, DEFAULT_DESIRED_ACCURACY_METERS } from 'utils/functions_geolocation';

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
    const { t } = useTranslation(['geolocation', 'common']);
    let radius = 5;
    const [takingCoords, setTakingCoords]: any = useState(false);
    const [desiredAccuracy, setDesiredAccuracy] = useState(`${DEFAULT_DESIRED_ACCURACY_METERS}`);

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
                    t('common:alert'), t('geolocation:must_be_within_radius', { radius, plural: radius > 1 ? 's' : '' }), [
                    {
                        text: t('common:ok'), onPress: async () => {

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
        let location = await getBestLocation(Number(desiredAccuracy) || DEFAULT_DESIRED_ACCURACY_METERS);
        if (location){
            after_get_coords(location);
        }else{
            Alert.alert(
                t('common:alert'), t('geolocation:permission_denied'), [
                {
                    text: t('common:ok'), onPress: async () => {

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
                    <Text style={styles.title}>{title ? title : t('geolocation:precise_localization_title')}</Text>
                    <View>
                        <Text>{t('geolocation:latitude_colon')}{location.latitude}</Text>
                        <Text>{t('geolocation:longitude_colon')}{location.longitude}</Text>
                        <Text>{t('geolocation:accuracy_colon')}{location.accuracy ? `${location.accuracy.toFixed(2)} ${t('geolocation:meter_plural')}` : t('common:not_available')}</Text>
                        <Text>{t('geolocation:date_time_colon')}{takingDate ? t('geolocation:date_at_time', { date: moment(takingDate).format('dddd DD, MMMM YYYY'), time: moment(takingDate).format('HH:mm') }) : t('common:not_available')}</Text>

                    </View>
                </View>
            ) : (
                // <Text>Auncune information disponible</Text>
                <Text>{" "}</Text>
            )}</>}
            {error && <Text style={styles.error}>{t('geolocation:error_prefix')}{error} {(error.includes("No location provider available")) ? t('geolocation:retry_click_hint', { buttonLabel: btnTitle ? btnTitle : t('geolocation:get_position_button') }) : ""}</Text>}
            {takingCoords && <Text style={{ color: 'purple' }}>{t('geolocation:fetching_in_progress')}
                {/* si la récupération prend du temps, veuillez recliquer sur le "{btnTitle ? btnTitle : "Obtenir votre Position"}" pour relancer. */}
            </Text>}
            <View style={styles.accuracyContainer}>
                <Text>{t('geolocation:desired_accuracy_label')}</Text>
                <TextInput
                    style={styles.accuracyInput}
                    keyboardType="numeric"
                    value={desiredAccuracy}
                    onChangeText={setDesiredAccuracy}
                    placeholder={`${DEFAULT_DESIRED_ACCURACY_METERS}`}
                />
            </View>
            <Button disabled={takingCoords} title={btnTitle ? btnTitle : t('geolocation:get_position_button')} onPress={() => {
                if (!takingCoords) {
                    getBestLocationLocal();
                } else {
                    Alert.alert(
                        t('common:alert'), t('geolocation:fetching_already_in_progress'), [
                        { text: t('common:ok'), onPress: async () => { } }
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
    accuracyContainer: {
        alignItems: 'center',
        marginBottom: 11,
    },
    accuracyInput: {
        borderWidth: 1,
        borderColor: '#dedede',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        width: 100,
        textAlign: 'center',
        marginTop: 4,
    },
});

export default LocationPosition;
