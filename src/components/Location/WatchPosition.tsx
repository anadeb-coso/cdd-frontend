import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Button, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const WatchPosition = ({ location, setLocation, accuracy, setAccuracy, error, setError }: {
    location?: any;
    setLocation: (i: any) => void;
    accuracy?: any;
    setAccuracy: (i: any) => void;
    error?: any;
    setError: (i: any) => void;
  }) => {
    const { t } = useTranslation(['geolocation', 'common']);
    const [watchId, setWatchId]: any = useState(null);

    const startWatching = () => {
        const id = Geolocation.watchPosition(
            (position) => {
                const { coords } = position;
                setLocation({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
                setAccuracy(coords.accuracy); // Précision en mètres
                setError(null);
            },
            (err) => {
                setError(err.message);
            },
            {
                enableHighAccuracy: true, // Utiliser le GPS pour une précision maximale
                distanceFilter: 1,       // Mettre à jour la position si l'utilisateur se déplace d'au moins 1 mètre
                interval: 5000,          // Intervalle de mise à jour (5 secondes)
                fastestInterval: 2000,   // Intervalle minimum (2 secondes, pour Android)
            }
        );

        setWatchId(id);
    };

    const stopWatching = () => {
        if (watchId !== null) {
            Geolocation.clearWatch(watchId); // Arrête le suivi
            setWatchId(null);
        }
    };

    useEffect(() => {
        // Nettoyage lorsque le composant est démonté
        return () => {
            if (watchId !== null) {
                Geolocation.clearWatch(watchId);
            }
        };
    }, [watchId]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('geolocation:watch_position_title')}</Text>
            {location ? (
                <View>
                    <Text style={styles.text}>{t('geolocation:latitude_colon')}{location.latitude}</Text>
                    <Text style={styles.text}>{t('geolocation:longitude_colon')}{location.longitude}</Text>
                    <Text style={styles.text}>
                        {t('geolocation:accuracy_colon')}{accuracy ? `${accuracy.toFixed(2)} ${t('geolocation:meter_plural')}` : t('common:not_available')}
                    </Text>
                </View>
            ) : (
                <Text style={styles.text}>{t('geolocation:no_position_available')}</Text>
            )}
            {error && <Text style={styles.error}>{t('geolocation:error_prefix')}{error}</Text>}
            <View style={styles.buttons}>
                <Button title={t('geolocation:start_watching')} onPress={startWatching} />
                <Button title={t('geolocation:stop_watching')} onPress={stopWatching} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
    buttons: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between',
        width: '60%',
    },
});

export default WatchPosition;
