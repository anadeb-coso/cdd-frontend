/** COSOCollect : consultation (lecture seule) de toutes les données d'un enregistrement. */
import React, { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { colors } from '../../utils/colors';
import { PrivateStackParamList } from '../../types/navigation';
import { fieldType } from '../../utils/collectTitle';
import { mediaPreviewUri } from '../../components/common/MediaInput';
import { warmUpCollectToken } from '../../services/collect/api';
import { observeLocalForm, observeSubmissions } from '../../services/collect/store';
import {
  ClosedBanner, commonStyles as cs, formatDate, SubmissionStatusPill, useObservableValue, useOwnerKey,
} from './common';

type Node = { key: string; label: string; type: string; prop: any; opts: any };

function orderedKeys(props: any, order: any): string[] {
  const all = Object.keys(props || {});
  if (!Array.isArray(order)) return all;
  const seen: Record<string, 1> = {};
  const out: string[] = [];
  order.forEach((k: string) => { if (props[k] && !seen[k]) { seen[k] = 1; out.push(k); } });
  all.forEach((k) => { if (!seen[k]) out.push(k); });
  return out;
}

function children(objSchema: any, opts: any): Node[] {
  const props = (objSchema && objSchema.properties) || {};
  const fields = (opts && opts.fields) || {};
  return orderedKeys(props, opts && opts.order).map((key) => {
    const o = fields[key] || {};
    return { key, label: o.label || key, type: fieldType(props[key], o), prop: props[key] || {}, opts: o };
  });
}

function choiceLabel(node: Node, value: any): string {
  const enumValue = node.type === 'select_one' ? node.prop.enum : (node.prop.items || {}).enum;
  if (enumValue && !Array.isArray(enumValue) && enumValue[value] !== undefined) return String(enumValue[value]);
  const row = (node.opts.dataset || []).find((r: any) => String(r.v) === String(value));
  return row ? String(row.l || row.v) : String(value);
}

function displayValue(node: Node, value: any): string {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) return '';
  switch (node.type) {
    case 'select_one': return choiceLabel(node, value);
    case 'select_multiple':
    case 'select_multiple_check': return (Array.isArray(value) ? value : [value]).map((v) => `• ${choiceLabel(node, v)}`).join('\n');
    case 'date': return moment(value).isValid() ? moment(value).format('DD/MM/YYYY') : String(value);
    case 'datetime': return moment(value).isValid() ? moment(value).format('DD/MM/YYYY HH:mm') : String(value);
    case 'time': return moment(value).isValid() ? moment(value).format('HH:mm') : String(value);
    default: return typeof value === 'object' ? '' : String(value);
  }
}

function Fields({ nodes, values, depth }: { nodes: Node[]; values: any; depth: number }) {
  const { t } = useTranslation('coso_collect');
  return (
    <>
      {nodes.map((node) => {
        const value = values ? values[node.key] : undefined;
        if (node.type === 'note') {
          return <Text key={node.key} style={{ color: '#707070', fontStyle: 'italic', marginVertical: 6 }}>{node.label}</Text>;
        }
        if (node.type === 'group') {
          return (
            <View key={node.key} style={{ borderLeftWidth: 3, borderLeftColor: '#d7f2e6', paddingLeft: 10, marginVertical: 6 }}>
              <Text style={{ fontWeight: '700', color: '#36424b', marginBottom: 4 }}>{node.label}</Text>
              <Fields nodes={children(node.prop, node.opts)} values={value || {}} depth={depth + 1} />
            </View>
          );
        }
        if (node.type === 'repeat') {
          const rows = Array.isArray(value) ? value : [];
          const itemOpts = node.opts.item && node.opts.item.fields ? node.opts.item : node.opts;
          const sub = children(node.prop.items, itemOpts);
          return (
            <View key={node.key} style={{ marginVertical: 6 }}>
              <Text style={{ fontWeight: '700', color: '#36424b', marginBottom: 4 }}>{`${node.label} (${rows.length})`}</Text>
              {rows.length ? rows.map((row: any, i: number) => (
                // eslint-disable-next-line react/no-array-index-key
                <View key={i} style={{ backgroundColor: '#fafbfc', borderWidth: 1, borderColor: '#edf0f2', borderRadius: 8, padding: 8, marginBottom: 6 }}>
                  <Text style={cs.muted}>{`#${i + 1}`}</Text>
                  <Fields nodes={sub} values={row || {}} depth={depth + 1} />
                </View>
              )) : <Text style={cs.muted}>{t('no_row')}</Text>}
            </View>
          );
        }
        let content: React.ReactNode;
        if ((node.type === 'photo' || node.type === 'file') && value && typeof value === 'object') {
          const uri = mediaPreviewUri(value);
          const isImage = node.type === 'photo' || String(value.mime || '').startsWith('image/');
          content = isImage && uri ? (
            <TouchableOpacity onPress={() => Linking.openURL(uri).catch(() => undefined)}>
              <Image source={{ uri }} style={{ width: '100%', height: 200, borderRadius: 8, backgroundColor: '#f1f3f5' }} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => uri && Linking.openURL(uri).catch(() => undefined)} style={cs.row}>
              <Feather name="paperclip" size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, marginLeft: 6 }}>{value.name}</Text>
            </TouchableOpacity>
          );
        } else if (node.type === 'geopoint' && value && typeof value === 'object' && value.latitude !== undefined) {
          content = (
            <TouchableOpacity
              style={cs.row}
              onPress={() => Linking.openURL(`geo:${value.latitude},${value.longitude}?q=${value.latitude},${value.longitude}`).catch(() => undefined)}
            >
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, marginLeft: 6 }}>
                {`${Number(value.latitude).toFixed(6)}, ${Number(value.longitude).toFixed(6)}`}
                {value.accuracy ? ` (± ${Math.round(value.accuracy)} m)` : ''}
              </Text>
            </TouchableOpacity>
          );
        } else {
          const text = displayValue(node, value);
          content = <Text style={{ color: text ? '#24313a' : '#a0aab1', fontSize: 14 }}>{text || '—'}</Text>;
        }
        return (
          <View key={node.key} style={{ paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f0f2f4' }}>
            <Text style={{ color: '#707070', fontSize: 12, marginBottom: 3 }}>{node.label}</Text>
            {content}
          </View>
        );
      })}
    </>
  );
}

function CollectSubmissionView() {
  const { t } = useTranslation('coso_collect');
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const route: any = useRoute();
  const { uuid, formServerId } = route.params || {};
  const owner = useOwnerKey();
  const formRows = useObservableValue<any[]>(() => (owner ? observeLocalForm(owner, formServerId) : null), [owner, formServerId], []);
  const submissions = useObservableValue<any[]>(() => (owner ? observeSubmissions(owner, formServerId) : null), [owner, formServerId], []);
  const form = formRows[0] || null;
  const record = submissions.find((s: any) => s.uuid === uuid) || null;
  // Jeton requis pour afficher les photos reçues du serveur (pas encore présentes sur l'appareil).
  const [, setTokenReady] = useState(false);
  useEffect(() => { warmUpCollectToken().then(() => setTokenReady(true)); }, []);

  if (!form || !record) return <View style={cs.container} />;
  const pages: any[] = form.form || [];
  const data: any[] = record.data || [];
  const canEdit = form.isOpen && !record.isLocked;

  return (
    <View style={cs.container}>
      {!form.isOpen ? <ClosedBanner message={form.closeMessage || t('form_closed_default')} /> : null}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[cs.title, { fontSize: 16 }]}>{record.title}</Text>
        <View style={{ marginTop: 6 }}><SubmissionStatusPill status={record.status} editable={record.editable} /></View>
        <Text style={[cs.muted, { marginTop: 6 }]}>
          {t('recorded_on', { date: formatDate(record.createdAtLocal) })}
          {record.submittedAtLocal ? `  ·  ${t('sent_on', { date: formatDate(record.submittedAtLocal) })}` : ''}
        </Text>
        {record.isLocked ? (
          <View style={{ backgroundColor: '#f1f3f5', borderRadius: 10, padding: 10, marginTop: 10 }}>
            <Text style={{ color: '#495057', fontSize: 13 }}>{t('locked_banner')}</Text>
          </View>
        ) : null}
        {canEdit ? (
          <TouchableOpacity
            style={[cs.primaryButton, { marginTop: 12 }]}
            onPress={() => navigation.replace('CollectFill', { uuid, formServerId })}
          >
            <Feather name="edit-2" size={15} color="white" />
            <Text style={cs.primaryButtonText}>{t('edit_record')}</Text>
          </TouchableOpacity>
        ) : null}
        {pages.map((page: any, i: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <View key={i} style={[cs.card, { marginHorizontal: 0, marginTop: 12 }]}>
            {pages.length > 1 ? (
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
                {t('page_x_of_y', { x: i + 1, y: pages.length })}
              </Text>
            ) : null}
            <Fields nodes={children(page.page, page.options)} values={data[i] || {}} depth={0} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default CollectSubmissionView;
