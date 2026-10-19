// Langues des pages web du CDD (cdd-backend cdd/settings.py::LANGUAGES).
const CDD_LANGUAGES = ['fr', 'en'];

// URL d'une page web du CDD affichée dans l'application (ex. « Mot de passe perdu »), préfixée
// par la langue de l'application : sans préfixe, le CDD choisit la langue d'après le téléphone
// (en-tête Accept-Language), d'où une page en anglais alors que l'application est en français.
export const cddPageUrl = (baseUrl: string, path: string, language?: string | null, defaultLanguage = 'fr'): string => {
  const code = String(language || '').split('-')[0].toLowerCase();
  const prefix = CDD_LANGUAGES.includes(code) ? code : defaultLanguage;
  return `${String(baseUrl || '').replace(/\/+$/, '')}/${prefix}/${path.replace(/^\/+/, '')}`;
};
