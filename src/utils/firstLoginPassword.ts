// Mot de passe initial (compte créé dans le DCC) à changer à la première connexion : le DCC refuse la connexion
// (`authentication/obtain-auth-credentials/`, statut 403 + `password_change_required`) tant qu'il n'a été changé
// sur aucune plateforme (DCC, MGP, SIG). L'écran FirstLoginPassword le change par
// `authentication/api/first-login-password/`, valable pour toutes les plateformes.

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;

export const isPasswordChangeRequired = (response: any): boolean =>
  Boolean(response && response.password_change_required);

// Mêmes règles que le serveur (authentication/accounts.py::validate_new_password) : lettres et chiffres, au moins
// une lettre et un chiffre, 8 à 16 caractères, différent du mot de passe actuel. Renvoie des clés de traduction.
export function newPasswordErrorKeys(newPassword: string, confirmation: string, currentPassword?: string): string[] {
  const errors: string[] = [];
  const password = newPassword || '';
  if (!password) {
    return ['first_login_password.required'];
  }
  if (password !== (confirmation || '')) {
    errors.push('first_login_password.mismatch');
  }
  if (!/^[A-Za-z0-9]+$/.test(password)) {
    errors.push('first_login_password.letters_digits_only');
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push('first_login_password.min_length');
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push('first_login_password.max_length');
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push('first_login_password.needs_letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('first_login_password.needs_digit');
  }
  if (currentPassword && password === currentPassword) {
    errors.push('first_login_password.same_as_current');
  }
  return errors;
}

export const firstLoginPasswordPayload = (
  login: string, currentPassword: string, newPassword: string, confirmation: string, language?: string | null,
) => ({
  login,
  current_password: currentPassword,
  new_password: newPassword,
  new_password_confirm: confirmation,
  platform: 'dcc_mobile',
  language: language || 'fr',
});
