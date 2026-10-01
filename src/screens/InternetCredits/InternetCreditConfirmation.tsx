import React, { useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Checkbox, TextInput } from 'react-native-paper';
import SignatureScreen from 'react-native-signature-canvas';
import { useToast } from 'native-base';
import { useTranslation } from 'react-i18next';
import { colors } from '../../utils/colors';
import {
  confirmInternetCredit,
  refreshInternetCreditNotifications,
  useInternetCreditNotifications,
} from '../../services/grm/internetCredits';
import { formatAmount, formatDate, notificationStatus } from './notificationStatus';

// Masque le pied de page (boutons) intégré au pad : on utilise nos propres boutons.
const SIGNATURE_WEB_STYLE = `
  .m-signature-pad { box-shadow: none; border: none; margin: 0; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; margin: 0; }
  body, html { height: 100%; }
`;

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function InternetCreditConfirmation({ route, navigation }: any) {
  const { t } = useTranslation('internet_credits');
  const toast = useToast();
  const signatureRef = useRef<any>(null);
  const { items } = useInternetCreditNotifications();
  const [checked, setChecked] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const notification = items.find((item) => item.id === route.params?.beneficiaryId);

  if (!notification) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.muted}>{t('no_longer_pending')}</Text>
        <Button mode="text" onPress={() => navigation.goBack()} labelStyle={{ color: colors.primary }}>{t('back')}</Button>
      </SafeAreaView>
    );
  }

  const { campaign, role, message, my_confirmation, cvgp_confirmation, fc_confirmations } = notification;
  const isCvgp = role === 'cvgp';
  const status = notificationStatus(notification, t);
  const canSubmit = checked && !!signature && !saving;

  const onSubmit = async () => {
    if (!canSubmit || !signature) return;
    setSaving(true);
    try {
      await confirmInternetCredit({ beneficiary: notification.id, checked: true, signature, description, message });
      toast.show({ description: t('confirmation_saved'), placement: 'top', bgColor: 'green.600' });
      await refreshInternetCreditNotifications();
      navigation.goBack();
    } catch (err: any) {
      setSaving(false);
      const detail = err?.response?.data?.detail;
      toast.show({ description: detail || t(err?.response ? 'confirmation_error' : 'network_required'), placement: 'top', bgColor: 'red.600' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={scrollEnabled} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{t('notification_title', { month: campaign.month_label })}</Text>
          <InfoRow label={t('sent_date')} value={formatDate(campaign.sent_date)} />
          <InfoRow label={t('package')} value={`${campaign.package_label} — ${formatAmount(campaign.amount)}`} />
          <InfoRow label={t('cvd_label')} value={notification.cvd_name} />
          {notification.village_names !== notification.cvd_name && (
            <InfoRow label={t('villages')} value={notification.village_names} />
          )}
          {!isCvgp && <InfoRow label={t('cvgp_member')} value={notification.member_name} />}
          {!isCvgp && <InfoRow label={t('phone')} value={notification.phone_number} />}
        </View>

        {!isCvgp && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t('confirmations_status')}</Text>
            <Text style={styles.statusLine}>
              {t('cvgp_member')} :{' '}
              <Text style={{ color: cvgp_confirmation ? colors.primary : colors.error }}>
                {cvgp_confirmation ? t('confirmed_on', { date: formatDate(cvgp_confirmation.confirmed_at) }) : t('not_confirmed')}
              </Text>
            </Text>
            <Text style={styles.statusLine}>
              FC/AC :{' '}
              <Text style={{ color: fc_confirmations.length ? colors.primary : colors.error }}>
                {fc_confirmations.length
                  ? fc_confirmations.map((c) => `${c.confirmed_by_name} (${formatDate(c.confirmed_at)})`).join(', ')
                  : t('not_confirmed')}
              </Text>
            </Text>
          </View>
        )}

        {my_confirmation ? (
          <View style={styles.card}>
            <Text style={[styles.statusLine, { color: status.color }]}>{status.text}</Text>
            <Text style={styles.muted}>{t('you_confirmed_on', { date: formatDate(my_confirmation.confirmed_at) })}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <TouchableOpacity style={styles.checkRow} onPress={() => setChecked(!checked)} activeOpacity={0.7}>
              <Checkbox.Android color={colors.primary} status={checked ? 'checked' : 'unchecked'}
                onPress={() => setChecked(!checked)} />
              <Text style={styles.message}>{message}</Text>
            </TouchableOpacity>

            <View style={styles.signatureHeader}>
              <Text style={styles.sectionTitle}>{t('signature')}</Text>
              <Button compact mode="text" uppercase={false} labelStyle={{ color: colors.primary }}
                onPress={() => { signatureRef.current?.clearSignature(); setSignature(null); }}>
                {t('clear_signature')}
              </Button>
            </View>
            <View style={styles.signaturePad}>
              <SignatureScreen
                ref={signatureRef}
                onBegin={() => setScrollEnabled(false)}
                onEnd={() => { setScrollEnabled(true); signatureRef.current?.readSignature(); }}
                onOK={(img: string) => setSignature(img)}
                onEmpty={() => setSignature(null)}
                webStyle={SIGNATURE_WEB_STYLE}
                backgroundColor="rgba(255,255,255,1)"
                penColor="#111111"
                imageType="image/png"
                trimWhitespace
                autoClear={false}
                descriptionText=""
              />
            </View>
            {!signature && <Text style={styles.hint}>{t('sign_here')}</Text>}

            <TextInput
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              outlineColor="#b8c3ca"
              activeOutlineColor={colors.primary}
              label={t('description_optional')}
              value={description}
              onChangeText={setDescription}
            />

            <Button
              mode="contained"
              buttonColor={colors.primary}
              uppercase={false}
              disabled={!canSubmit}
              loading={saving}
              onPress={onSubmit}
              style={styles.submit}
              labelStyle={{ color: 'white' }}
            >
              {t('confirm_button')}
            </Button>
            {!checked && <Text style={styles.hint}>{t('check_first')}</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7f6' },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 30 },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 14, elevation: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#373737', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#373737' },
  infoRow: { flexDirection: 'row', paddingVertical: 3 },
  infoLabel: { width: 120, fontSize: 12, color: '#707070' },
  infoValue: { flex: 1, fontSize: 13, color: '#373737' },
  statusLine: { fontSize: 13, color: '#373737', marginTop: 6 },
  muted: { fontSize: 13, color: '#707070', marginTop: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start' },
  message: { flex: 1, fontSize: 14, color: '#373737', paddingTop: 7 },
  signatureHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  signaturePad: {
    height: 200, borderWidth: 1, borderStyle: 'dashed', borderColor: '#b8c3ca', borderRadius: 10, overflow: 'hidden',
  },
  hint: { fontSize: 11, color: '#8a97a3', marginTop: 6 },
  input: { marginTop: 14, backgroundColor: 'white' },
  submit: { marginTop: 16, borderRadius: 12, paddingVertical: 4 },
});

export default InternetCreditConfirmation;
