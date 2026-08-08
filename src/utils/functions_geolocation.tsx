// import * as RNGeolocation from 'react-native-geolocation-service';
import Geolocation from 'react-native-geolocation-service';
import * as CGeolocation from '@react-native-community/geolocation';
import * as Location from 'expo-location';
import { Alert, Platform, ToastAndroid } from 'react-native';
import i18n from '../translations/i18n';

const t = (key: string, options?: any): string => i18n.t(key, { ns: 'geolocation', ...options }) as string;
const tc = (key: string, options?: any): string => i18n.t(key, { ns: 'common', ...options }) as string;

export const DEFAULT_DESIRED_ACCURACY_METERS = 20;
// Au-delà de ce délai, on arrête de chercher un point plus précis et on retourne le meilleur
// trouvé jusque-là — pour ne pas bloquer indéfiniment l'utilisateur si l'environnement ne permet
// pas d'atteindre la précision demandée (intérieur, faible couverture GPS, etc.).
const MAX_SEARCH_DURATION_MS = 30000; // 30 secondes pour laisser le temps au GPS de s'affiner (en intérieur, il peut ne jamais atteindre la précision demandée)
const RETRY_DELAY_MS = 1500; // 1,5 secondes entre deux tentatives de géolocalisation (pour laisser le temps au GPS de s'affiner)

const requestPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert(
            t('permission_required_title'),
            t('permission_required_message'),
            [{ text: tc('ok') }]
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
                // Toujours redemander une position fraîche au capteur (pas de position mise en
                // cache) : sinon les tentatives successives renverraient la même précision et la
                // recherche d'un point plus précis n'aurait aucun effet.
                maximumAge: 0,
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
        const unit = position.coords.accuracy >= 2 ? t('meter_plural') : t('meter_singular');
        ToastAndroid.show(t('provider_precision_toast', { type, accuracy: Math.round(position.coords.accuracy), unit }), ToastAndroid.SHORT);
    }
};

// Essaye chaque fournisseur de localisation l'un après l'autre (un device n'a pas forcément tous
// les fournisseurs opérationnels) et retourne la première position obtenue, quelle que soit sa
// précision — c'est `getBestLocation` qui décide si cette précision est suffisante ou s'il faut
// retenter.
const tryEveryProvider = async (): Promise<any> => {
    try {
        const position: any = await getRNGeolocation();
        toast(position, 'RNGS');
        if (position) return position;
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
                const position = await getExpoLocation();
                toast(position, 'EL');
                return position;
            }
        }
        const position: any = await getCommunityGeolocation();
        toast(position, 'RNCG');
        if (position) return position;
    } catch (e) {
        console.warn("@community/geolocation a échoué. Tentative avec Expo...");
    }

    try {
        const position = await getExpoLocation();
        toast(position, 'EL');
        if (position) return position;
    } catch (e) {
        console.warn("Toutes les tentatives de géolocalisation ont échoué.", e);
    }

    return null;
};

/**
 * Recherche un point GPS dont la précision (`coords.accuracy`, en mètres) est inférieure ou
 * égale à `desiredAccuracyMeters` (20 m par défaut). Le GPS s'affine progressivement après
 * l'activation du capteur : on retente donc plusieurs fois, en gardant la meilleure position
 * rencontrée, jusqu'à obtenir la précision demandée ou jusqu'à expiration de
 * `MAX_SEARCH_DURATION_MS`, auquel cas la meilleure position trouvée est retournée avec un
 * avertissement.
 */
export const getBestLocation = async (desiredAccuracyMeters: number = DEFAULT_DESIRED_ACCURACY_METERS) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
        return null;
    }

    const deadline = Date.now() + MAX_SEARCH_DURATION_MS;
    let best: any = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const position = await tryEveryProvider();

        if (position?.coords) {
            if (!best || (position.coords.accuracy ?? Infinity) < (best.coords.accuracy ?? Infinity)) {
                best = position;
            }
            if (position.coords.accuracy != null && position.coords.accuracy <= desiredAccuracyMeters) {
                return best;
            }
        }

        if (Date.now() >= deadline) break;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }

    if (best) {
        const bestAccuracy = Math.round(best.coords.accuracy);
        Alert.alert(
            t('accuracy_limited_title'),
            t('accuracy_limited_message', {
                desired: desiredAccuracyMeters,
                desiredUnit: t(desiredAccuracyMeters > 1 ? 'meter_plural' : 'meter_singular'),
                best: bestAccuracy,
                bestUnit: t(bestAccuracy > 1 ? 'meter_plural' : 'meter_singular'),
            }),
            [{ text: tc('ok') }]
        );
        return best;
    }

    Alert.alert(
        tc('information'),
        t('cannot_get_position'),
        [{ text: tc('ok') }]
    );

    return null;
};
