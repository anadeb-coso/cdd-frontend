import React, { useState, useEffect } from 'react';
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
    // const [location, setLocation]: any = useState(null);
    // const [accuracy, setAccuracy]: any = useState(null);
    // const [error, setError]: any = useState(null);
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
            <Text style={styles.title}>Suivi de Position en Temps Réel</Text>
            {location ? (
                <View>
                    <Text style={styles.text}>Latitude: {location.latitude}</Text>
                    <Text style={styles.text}>Longitude: {location.longitude}</Text>
                    <Text style={styles.text}>
                        Précision: {accuracy ? `${accuracy.toFixed(2)} mètres` : 'N/A'}
                    </Text>
                </View>
            ) : (
                <Text style={styles.text}>Aucune position disponible</Text>
            )}
            {error && <Text style={styles.error}>Erreur: {error}</Text>}
            <View style={styles.buttons}>
                <Button title="Démarrer le suivi" onPress={startWatching} />
                <Button title="Arrêter le suivi" onPress={stopWatching} />
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
