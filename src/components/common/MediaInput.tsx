/**
 * Champs « Photo » et « Fichier / document » des formulaires COSOCollect (types `photo` / `file`
 * du générateur de formulaire web).
 *
 * - Valeur : { local_uri, name, mime, size } tant que le fichier n'est que sur l'appareil, puis
 *   { attachment_id, name, mime, size, local_uri? } une fois reçu par le serveur (cf.
 *   services/collect/sync.ts). Le fichier choisi est copié dans le stockage de l'application.
 * - Intégration tcomb-form-native : `MediaInput` (sous-classe de `t.form.Component`) est injecté
 *   comme `options.fields.<champ>.factory` par `applyMediaFactory`, comme `GeoPointInput`.
 */
import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Box, Button, HStack, Spinner, Text } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import { FontAwesome5 } from '@expo/vector-icons';

import { attachmentUrl } from '../../services/collect/api';
import { persistLocalFile } from '../../services/collect/store';

const tcomb: any = require('tcomb-form-native');

export type MediaValue = {
  local_uri?: string;
  attachment_id?: number;
  name?: string;
  mime?: string;
  size?: number;
} | null;

const MAX_PHOTO_WIDTH = 1600;

export function mediaPreviewUri(value: MediaValue): string | null {
  if (!value) return null;
  if (value.local_uri) return value.local_uri;
  if (value.attachment_id) return attachmentUrl(value.attachment_id);
  return null;
}

function MediaWidget(props: {
  kind: 'photo' | 'file';
  value: MediaValue;
  hidden?: boolean;
  label?: string;
  help?: string;
  hasError?: boolean;
  error?: any;
  editable?: boolean;
  submissionUuid: string;
  onChange: (v: MediaValue) => void;
}) {
  const { t } = useTranslation('coso_collect');
  const [busy, setBusy] = React.useState(false);
  const { value, kind } = props;
  if (props.hidden) return null;
  const disabled = props.editable === false || busy;

  const store = async (uri: string, name: string, mime: string, size?: number) => {
    const localUri = await persistLocalFile(props.submissionUuid || 'tmp', uri, name);
    let finalSize = size;
    if (finalSize === undefined) {
      const info: any = await FileSystem.getInfoAsync(localUri).catch(() => null);
      finalSize = info && info.size ? info.size : 0;
    }
    props.onChange({ local_uri: localUri, name, mime, size: finalSize });
  };

  const fromImagePicker = async (camera: boolean) => {
    if (disabled) return;
    setBusy(true);
    try {
      const perm = camera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') return;
      const options: any = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1, exif: false };
      const result: any = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      if (result.canceled || !result.assets || !result.assets[0]) return;
      const asset = result.assets[0];
      // Photo réduite (largeur ≤ 1600 px, JPEG 70 %) : envoi plus rapide sur un réseau faible.
      const resized = await ImageManipulator.manipulateAsync(
        asset.uri,
        asset.width && asset.width > MAX_PHOTO_WIDTH ? [{ resize: { width: MAX_PHOTO_WIDTH } }] : [],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
      await store(resized.uri, `photo_${Date.now()}.jpg`, 'image/jpeg');
    } finally {
      setBusy(false);
    }
  };

  const fromDocumentPicker = async () => {
    if (disabled) return;
    setBusy(true);
    try {
      const result: any = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
      if (result.canceled || !result.assets || !result.assets[0]) return;
      const asset = result.assets[0];
      await store(asset.uri, asset.name || `document_${Date.now()}`, asset.mimeType || 'application/octet-stream', asset.size);
    } finally {
      setBusy(false);
    }
  };

  const preview = mediaPreviewUri(value);
  const isImage = kind === 'photo' || (value?.mime || '').startsWith('image/');

  return (
    <Box mb={4}>
      {!!props.label && (
        <Text fontSize="sm" color="#707070" fontWeight="600" mb={1}>{props.label}</Text>
      )}
      {!!props.help && <Text fontSize="xs" color="gray.500" mb={1}>{props.help}</Text>}
      <Box borderWidth={1} borderColor={props.hasError ? '#e53e3e' : '#dddddd'} borderRadius={10} p={3} bg="white">
        {value && (value.local_uri || value.attachment_id) ? (
          <Box mb={2}>
            {isImage && preview ? (
              <TouchableOpacity onPress={() => preview && Linking.openURL(preview).catch(() => undefined)}>
                <Image source={{ uri: preview }} style={{ width: '100%', height: 180, borderRadius: 8, backgroundColor: '#f1f3f5' }} resizeMode="cover" />
              </TouchableOpacity>
            ) : (
              <HStack space={2} alignItems="center">
                <FontAwesome5 name="file-alt" size={18} color="#707070" />
                <Text fontSize="sm" flex={1} numberOfLines={2}>{value.name}</Text>
              </HStack>
            )}
            <Text fontSize="xs" color={value.attachment_id ? 'green.600' : 'orange.500'} mt={1}>
              {value.attachment_id ? t('media_uploaded') : t('media_pending_upload')}
            </Text>
          </Box>
        ) : (
          <Text fontSize="sm" color="gray.500" mb={2}>{kind === 'photo' ? t('media_no_photo') : t('media_no_file')}</Text>
        )}
        {busy ? (
          <HStack space={2} alignItems="center"><Spinner size="sm" /><Text fontSize="xs" color="gray.500">{t('media_processing')}</Text></HStack>
        ) : props.editable === false ? null : (
          <HStack space={2} flexWrap="wrap">
            {kind === 'photo' ? (
              <>
                <Button size="sm" rounded="lg" flex={1} onPress={() => fromImagePicker(true)}
                  leftIcon={<FontAwesome5 name="camera" size={14} color="white" />}>
                  {t('media_take_photo')}
                </Button>
                <Button size="sm" rounded="lg" flex={1} variant="outline" onPress={() => fromImagePicker(false)}>
                  {t('media_gallery')}
                </Button>
              </>
            ) : (
              <Button size="sm" rounded="lg" flex={1} onPress={fromDocumentPicker}
                leftIcon={<FontAwesome5 name="paperclip" size={14} color="white" />}>
                {t('media_choose_file')}
              </Button>
            )}
            {value && (value.local_uri || value.attachment_id) ? (
              <Button size="sm" rounded="lg" variant="ghost" colorScheme="danger" onPress={() => props.onChange(null)}>
                {t('media_remove')}
              </Button>
            ) : null}
          </HStack>
        )}
      </Box>
      {props.hasError && !!props.error && <Text fontSize="xs" color="#e53e3e" mt={1}>{props.error}</Text>}
    </Box>
  );
}

class MediaInput extends tcomb.form.Component {
  getTemplate() {
    const self: any = this;
    return function render(locals: any) {
      const opts = self.props.options || {};
      return (
        <MediaWidget
          kind={opts.mode === 'file' ? 'file' : 'photo'}
          value={locals.value}
          hidden={locals.hidden}
          label={locals.label}
          help={opts.help}
          hasError={locals.hasError}
          error={locals.error}
          editable={opts.editable !== false}
          submissionUuid={opts.submissionUuid}
          onChange={locals.onChange}
        />
      );
    };
  }
}

export default MediaInput;

/**
 * Injecte `factory = MediaInput` (et l'uuid de la saisie, pour ranger les fichiers) sur chaque
 * champ `mode === 'photo' | 'file'` — groupes et répétables compris. Mute `options` et le renvoie.
 */
export function applyMediaFactory(options: any, submissionUuid: string): any {
  if (!options || typeof options !== 'object') return options;
  const walk = (fields: any) => {
    if (!fields || typeof fields !== 'object') return;
    Object.keys(fields).forEach((key) => {
      const f = fields[key];
      if (!f || typeof f !== 'object') return;
      if (f.mode === 'photo' || f.mode === 'file') {
        f.factory = MediaInput;
        f.submissionUuid = submissionUuid;
      }
      if (f.fields) walk(f.fields);
      if (f.item && f.item.fields) walk(f.item.fields);
    });
  };
  walk(options.fields);
  if (options.item && options.item.fields) walk(options.item.fields);
  return options;
}
