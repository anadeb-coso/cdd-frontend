import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_LANGUAGE_KEY = 'settings.lang';

// Langue par défaut au tout premier lancement (avant que l'utilisateur n'ait fait un choix
// explicite via le sélecteur de langue) : le français, langue de travail de l'équipe.
export const DEFAULT_LANGUAGE = 'fr';

export const languageDetectorPlugin = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  async detect(callback: (lng: string) => void) {
    try {
      const language = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
      if (language) {
        callback(language);
        return;
      }
      callback(DEFAULT_LANGUAGE);
    } catch (error) {
      console.log('Error reading language', error);
      callback(DEFAULT_LANGUAGE);
    }
  },
  async cacheUserLanguage(language: string) {
    try {
      await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
    } catch (error) {
      // ignore
    }
  },
};
