import i18n from 'i18next';
import 'intl-pluralrules';
import { initReactI18next } from 'react-i18next';
import { languageDetectorPlugin, DEFAULT_LANGUAGE } from './LanguageDetectorPlugin';

import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';
import enAppUpdate from './locales/en/app_update.json';
import frAppUpdate from './locales/fr/app_update.json';
import enGeolocation from './locales/en/geolocation.json';
import frGeolocation from './locales/fr/geolocation.json';
import enUtils from './locales/en/utils.json';
import frUtils from './locales/fr/utils.json';
import enSubprojects from './locales/en/subprojects.json';
import frSubprojects from './locales/fr/subprojects.json';
import enNews from './locales/en/news.json';
import frNews from './locales/fr/news.json';
import enOthers from './locales/en/others.json';
import frOthers from './locales/fr/others.json';
import enSupportMaterials from './locales/en/support_materials.json';
import frSupportMaterials from './locales/fr/support_materials.json';
import enStoreApp from './locales/en/store_app.json';
import frStoreApp from './locales/fr/store_app.json';
import enSettings from './locales/en/settings.json';
import frSettings from './locales/fr/settings.json';
import enPlanning from './locales/en/planning.json';
import frPlanning from './locales/fr/planning.json';
import enCore from './locales/en/core.json';
import frCore from './locales/fr/core.json';
import enComponents from './locales/en/components.json';
import frComponents from './locales/fr/components.json';
import enNavigation from './locales/en/navigation.json';
import frNavigation from './locales/fr/navigation.json';

// Espaces de nom : un fichier par grand module de l'application (voir src/translations/locales),
// pour permettre de faire évoluer les traductions module par module sans toucher un fichier
// monolithique partagé.
const resources = {
  en: {
    common: enCommon,
    app_update: enAppUpdate,
    geolocation: enGeolocation,
    utils: enUtils,
    subprojects: enSubprojects,
    news: enNews,
    others: enOthers,
    support_materials: enSupportMaterials,
    store_app: enStoreApp,
    settings: enSettings,
    planning: enPlanning,
    core: enCore,
    components: enComponents,
    navigation: enNavigation,
  },
  fr: {
    common: frCommon,
    app_update: frAppUpdate,
    geolocation: frGeolocation,
    utils: frUtils,
    subprojects: frSubprojects,
    news: frNews,
    others: frOthers,
    support_materials: frSupportMaterials,
    store_app: frStoreApp,
    settings: frSettings,
    planning: frPlanning,
    core: frCore,
    components: frComponents,
    navigation: frNavigation,
  },
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin as any)
  .init({
    resources,
    // Langue utilisée si les traductions ne sont pas disponibles dans la langue de l'utilisateur.
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: 'common',
    ns: Object.keys(resources.fr),
    // Les fichiers de traduction sont des objets JSON PLATS (une clé = un texte), où les clés
    // suivent la convention "ecran.description" (ex: "home.welcome_message") — un point utilisé
    // comme simple séparateur lisible dans le nom de la clé, PAS comme un chemin vers un objet
    // imbriqué. Le `keySeparator` par défaut de i18next ('.') interpréterait ces clés comme des
    // chemins imbriqués (resources.home.welcome_message) et échouerait à les résoudre puisque nos
    // fichiers ne sont pas imbriqués : on le désactive donc pour que "ecran.description" soit
    // traité comme une clé unique et littérale.
    keySeparator: false,
    interpolation: {
      escapeValue: false, // pas nécessaire avec React (déjà protégé contre le XSS)
    },
    // Le languageDetectorPlugin est asynchrone (lecture AsyncStorage), donc i18next
    // n'est "ready" qu'après résolution de cette promesse. Avec useSuspense activé
    // (comportement par défaut), le premier appel à useTranslation() suspend l'arbre
    // React pendant le rendu synchrone initial, ce qui déclenche l'erreur "A component
    // suspended while responding to synchronous input". On désactive donc useSuspense :
    // les composants reçoivent d'abord les clés/fallback puis se re-rendent une fois
    // les traductions chargées.
    react: {
      useSuspense: false,
    },
  });

export default i18n;
