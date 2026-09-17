/**
 * Champ « Coordonnées GPS » pour les formulaires de tâche (type de champ
 * `geopoint` produit par le form builder web).
 *
 * - Valeur stockée : { latitude, longitude, accuracy, altitude, altitudeAccuracy,
 *   heading, speed, timestamp, captured_at }.
 * - La capture suit EXACTEMENT la logique de `getBestLocation`
 *   (src/utils/functions_geolocation.tsx) : essais multi-fournisseurs, on retente
 *   jusqu'à atteindre la précision demandée (`accuracyThreshold`, en mètres) ou
 *   jusqu'au délai max, puis on retourne le meilleur point trouvé.
 *
 * Intégration tcomb-form-native : `GeoPointInput` (sous-classe de
 * `t.form.Component`) est injecté comme `options.fields.<champ>.factory` par
 * `applyGeoPointFactory()`, appelé par les écrans TaskDetail(/Test) après
 * `applyStyleRecursively` / `buildDynamicOptions`.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, HStack, Spinner, Text, VStack } from 'native-base';
import moment from 'moment';

import {
  getBestLocation,
  DEFAULT_DESIRED_ACCURACY_METERS,
} from '../../utils/functions_geolocation';

const tcomb: any = require('tcomb-form-native');

type GeoValue = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number | null;
  captured_at?: string | null;
} | null;

function coordsToValue(location: any): GeoValue {
  if (!location || !location.coords) return null;
  const c = location.coords;
  return {
    latitude: c.latitude,
    longitude: c.longitude,
    accuracy: c.accuracy != null ? Math.round(c.accuracy * 100) / 100 : null,
    altitude: c.altitude != null ? c.altitude : null,
    altitudeAccuracy: c.altitudeAccuracy != null ? c.altitudeAccuracy : null,
    heading: c.heading != null ? c.heading : null,
    speed: c.speed != null ? c.speed : null,
    timestamp: location.timestamp != null ? location.timestamp : Date.now(),
    captured_at: moment().toISOString(),
  };
}

function GeoPointWidget(props: {
  value: GeoValue;
  hidden?: boolean;
  label?: string;
  help?: string;
  hasError?: boolean;
  error?: any;
  editable?: boolean;
  accuracyThreshold: number;
  onChange: (v: GeoValue) => void;
}) {
  const { t } = useTranslation(['geolocation', 'common']);
  const [busy, setBusy] = React.useState(false);
  const v = props.value;
  const threshold = props.accuracyThreshold || DEFAULT_DESIRED_ACCURACY_METERS;

  if (props.hidden) return null;

  const capture = async () => {
    if (busy || props.editable === false) return;
    setBusy(true);
    try {
      const location = await getBestLocation(threshold);
      const value = coordsToValue(location);
      if (value) props.onChange(value);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    if (props.editable === false) return;
    props.onChange(null);
  };

  const accuracyOk = v && v.accuracy != null && v.accuracy <= threshold;
  const meterUnit = (n: number) =>
    n > 1 ? t('geolocation:meter_plural') : t('geolocation:meter_singular');

  return (
    <Box mb={4}>
      {!!props.label && (
        <Text fontSize="sm" color="#707070" fontWeight="600" mb={1}>
          {props.label}
        </Text>
      )}
      {!!props.help && (
        <Text fontSize="xs" color="gray.500" mb={1}>
          {props.help}
        </Text>
      )}

      <Box
        borderWidth={1}
        borderColor={props.hasError ? '#e53e3e' : '#dddddd'}
        borderRadius={10}
        p={3}
        bg="white"
      >
        {v && v.latitude != null ? (
          <VStack space={1}>
            <Text fontSize="sm">
              {t('geolocation:latitude_colon')}
              {v.latitude}
            </Text>
            <Text fontSize="sm">
              {t('geolocation:longitude_colon')}
              {v.longitude}
            </Text>
            <Text fontSize="sm" color={accuracyOk ? 'green.600' : 'orange.500'}>
              {t('geolocation:accuracy_colon')}
              {v.accuracy != null ? `${v.accuracy} ${meterUnit(v.accuracy)}` : '—'}
              {'  '}
              {accuracyOk
                ? `✓ ≤ ${threshold} ${meterUnit(threshold)}`
                : `⚠ > ${threshold} ${meterUnit(threshold)}`}
            </Text>
            {v.altitude != null && (
              <Text fontSize="xs" color="gray.500">
                {t('geolocation:geopoint_altitude', { defaultValue: 'Altitude : ' })}
                {Math.round(v.altitude)} m
              </Text>
            )}
            {!!v.captured_at && (
              <Text fontSize="xs" color="gray.500">
                {t('geolocation:date_time_colon')}
                {moment(v.captured_at).format('DD/MM/YYYY HH:mm')}
              </Text>
            )}
          </VStack>
        ) : (
          <Text fontSize="sm" color="gray.500">
            {t('geolocation:geopoint_not_captured', {
              defaultValue: 'Position non capturée',
            })}
          </Text>
        )}

        <Divider my={2} bg="gray.100" />

        {busy ? (
          <HStack space={2} alignItems="center">
            <Spinner size="sm" />
            <Text fontSize="xs" color="gray.500">
              {t('geolocation:geopoint_searching', {
                defaultValue:
                  "Recherche d'un point précis… (jusqu'à 30 s)",
              })}
            </Text>
          </HStack>
        ) : (
          <HStack space={2}>
            <Button flex={1} size="sm" rounded="lg" onPress={capture} isDisabled={props.editable === false}>
              {v && v.latitude != null
                ? t('geolocation:geopoint_recapture', { defaultValue: 'Recapturer' })
                : t('geolocation:geopoint_capture', {
                    defaultValue: 'Capturer la position GPS',
                  })}
            </Button>
            {v && v.latitude != null && (
              <Button
                size="sm"
                rounded="lg"
                variant="outline"
                colorScheme="danger"
                onPress={clear}
                isDisabled={props.editable === false}
              >
                {t('geolocation:geopoint_clear', { defaultValue: 'Effacer' })}
              </Button>
            )}
          </HStack>
        )}
      </Box>

      {props.hasError && !!props.error && (
        <Text fontSize="xs" color="#e53e3e" mt={1}>
          {props.error}
        </Text>
      )}
    </Box>
  );
}

/**
 * Sous-classe tcomb-form-native : délègue tout le stockage / la validation au
 * `Component` de base (valeur = objet, `t.Object` ou `t.maybe(t.Object)`), et
 * remplace seulement le rendu par `GeoPointWidget`.
 */
class GeoPointInput extends tcomb.form.Component {
  getTemplate() {
    const self: any = this;
    return function render(locals: any) {
      const opts = self.props.options || {};
      return (
        <GeoPointWidget
          value={locals.value}
          hidden={locals.hidden}
          label={locals.label}
          help={opts.help}
          hasError={locals.hasError}
          error={locals.error}
          editable={opts.editable !== false}
          accuracyThreshold={
            Number(opts.accuracyThreshold) || DEFAULT_DESIRED_ACCURACY_METERS
          }
          onChange={locals.onChange}
        />
      );
    };
  }
}

export default GeoPointInput;

/**
 * Parcourt `options.fields` (et `.fields` des groupes, `.item.fields` des
 * répétables) et injecte `factory = GeoPointInput` sur chaque champ marqué
 * `mode === 'geopoint'`. Idempotent : à rappeler après chaque transformation
 * qui clone les options (ex. `buildDynamicOptions`, qui perd les fonctions).
 * Mute `options` en place et le retourne.
 */
export function applyGeoPointFactory(options: any): any {
  if (!options || typeof options !== 'object') return options;

  const walk = (fields: any) => {
    if (!fields || typeof fields !== 'object') return;
    Object.keys(fields).forEach((key) => {
      const f = fields[key];
      if (!f || typeof f !== 'object') return;
      if (f.mode === 'geopoint') f.factory = GeoPointInput;
      if (f.fields) walk(f.fields);
      if (f.item && f.item.fields) walk(f.item.fields);
    });
  };

  walk(options.fields);
  if (options.item && options.item.fields) walk(options.item.fields);
  return options;
}
