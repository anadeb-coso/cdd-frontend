import { colors } from '../../utils/colors';
import { InternetCreditNotification } from '../../services/grm/internetCredits';

/** Statut affiché pour une notification de forfait (même règle que le MGP mobile). */
export function notificationStatus(notification: InternetCreditNotification, t: (key: string, opts?: any) => string) {
  const { role, my_confirmation, cvgp_confirmation, fc_confirmations } = notification;
  if (role === 'cvgp') return { text: t('status_to_confirm'), color: colors.error };
  if (my_confirmation) return { text: t('status_waiting_cvgp'), color: colors.inProgress };
  if (cvgp_confirmation) return { text: t('status_cvgp_confirmed_fc_pending'), color: colors.error };
  if (fc_confirmations.length) {
    return { text: t('status_other_fc_confirmed', { name: fc_confirmations[0].confirmed_by_name }), color: colors.inProgress };
  }
  return { text: t('status_to_confirm'), color: colors.error };
}

export const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const formatAmount = (amount: number) => `${String(amount ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
