// Module virtuel `@env` fourni par le plugin Babel `react-native-dotenv` (cf. babel.config.js) : il
// remplace à la compilation ces noms par les valeurs du fichier `.env`. TypeScript ne le voit pas,
// d'où cette déclaration (une ligne par variable importée dans src/services/env.tsx).
declare module '@env' {
  export const EXPO_PUBLIC_ANDROID_VERSION_CODE_ENV: string;
  export const EXPO_PUBLIC_PACKAGE_ENV: string;
  export const EXPO_PUBLIC_VERSION_ENV: string;
  export const EXPO_PUBLIC_GOOGLEMAPS_APIKEY_ENV: string;
  export const EXPO_PUBLIC_CDD_BASE_URL_ENV: string;
  export const EXPO_PUBLIC_MIS_BASE_URL_ENV: string;
  export const EXPO_PUBLIC_DIAGNOSTIC_MAP_LATITUDE_ENV: string;
  export const EXPO_PUBLIC_DIAGNOSTIC_MAP_LONGITUDE_ENV: string;
  export const EXPO_PUBLIC_COUCHDB_BASE_URL_ENV: string;
  export const EXPO_PUBLIC_CDD_PLAYSTORE_URL_ENV: string;
  export const EXPO_PUBLIC_GRM_PLAYSTORE_URL_ENV: string;
  export const EXPO_MAPBOX_ACCESS_TOKEN_ENV: string;
  export const EXPO_PUBLIC_GRM_BASE_URL_ENV: string;
}
