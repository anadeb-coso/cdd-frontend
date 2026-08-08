import i18n from '../translations/i18n';

// Chaque propriété résout sa traduction à chaque accès (pas une simple copie figée au chargement
// du module) : ainsi `MESSAGES.required` reste correct même si l'utilisateur change de langue
// après le premier rendu, sans que les écrans qui importent `MESSAGES` aient à changer quoi que
// ce soit à leur usage (`MESSAGES.required`, `MESSAGES.email`, etc. continuent de fonctionner tel
// quel). Des accesseurs `get` littéraux (plutôt qu'une boucle avec `Object.defineProperty`) pour
// que TypeScript puisse continuer à inférer la forme statique de cet objet depuis ce fichier .js.
const MESSAGES = {
  get required() {
    return i18n.t('form_error_required', { ns: 'common' });
  },
  get min() {
    return i18n.t('form_error_min', { ns: 'common' });
  },
  get max() {
    return i18n.t('form_error_max', { ns: 'common' });
  },
  get minLength() {
    return i18n.t('form_error_min_length', { ns: 'common' });
  },
  get maxLength() {
    return i18n.t('form_error_max_length', { ns: 'common' });
  },
  get email() {
    return i18n.t('form_error_email', { ns: 'common' });
  },
  get password() {
    return i18n.t('form_error_password', { ns: 'common' });
  },
  get onlyLetters() {
    return i18n.t('form_error_only_letters', { ns: 'common' });
  },
  get chargeRegex() {
    return i18n.t('form_error_charge_regex', { ns: 'common' });
  },
};

export default MESSAGES;
