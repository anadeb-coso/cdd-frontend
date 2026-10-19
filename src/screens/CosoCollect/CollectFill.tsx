/**
 * COSOCollect : saisie d'un enregistrement, page par page, avec le même moteur de formulaire que les
 * tâches (tcomb-form-native + règles / calculs / cascades du générateur web, cf. TaskDetail.tsx).
 *
 * Tout est d'abord enregistré sur l'appareil (WatermelonDB) — brouillon à chaque changement de page,
 * en quittant, et à la demande (« Enregistrer le brouillon » en bas, sans quitter la saisie) — puis
 * envoyé au serveur dès qu'il y a une connexion (requestCollectSync).
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView, useToast } from 'native-base';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { colors } from '../../utils/colors';
import { PrivateStackParamList } from '../../types/navigation';
import { applyStyleRecursively } from '../../utils/functions';
import { applyChoicesFromToOptions, relaxChoicesFromSchema } from '../../utils/choicesFrom';
import { applyGeoPointFactory } from '../../components/common/GeoPointInput';
import { applyCheckListFactory } from '../../components/common/CheckListInput';
import { applyGroupTitleFactory } from '../../components/common/GroupTitle';
import { applyMediaFactory } from '../../components/common/MediaInput';
import {
  deleteLocalDraft, getLocalForm, getSubmission, saveSubmissionLocally, SubmissionStatus,
} from '../../services/collect/store';
import { isOnline, requestCollectSync } from '../../services/collect/sync';
import { ClosedBanner, commonStyles as cs, useAuthorName, useOwnerKey } from './common';

const t = require('tcomb-form-native');
const transform = require('../../utils/functions_tcomb_json_schema');

const { Form } = t.form;
const WIDTH = Dimensions.get('window').width;

if (t.form.Form.stylesheet.button.backgroundColor !== '#24c38b') t.form.Form.stylesheet.button.backgroundColor = '#24c38b';
if (t.form.Form.stylesheet.controlLabel.normal.color === '#000000') t.form.Form.stylesheet.controlLabel.normal.color = '#707070';

const clone = (v: any) => JSON.parse(JSON.stringify(v === undefined ? null : v));

/** Brouillon enregistré sans validation (retour, « Enregistrer et quitter ») : tcomb n'a pas encore
 * converti les champs numériques (« 25 » saisi = chaîne) ; on le fait selon le schéma de la page. */
function coerceNumbers(schema: any, value: any): any {
  if (value === null || value === undefined || !schema) return value;
  if (schema.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
    const out: any = { ...value };
    Object.keys(schema.properties || {}).forEach((key) => {
      if (key in out) out[key] = coerceNumbers(schema.properties[key], out[key]);
    });
    return out;
  }
  if (schema.type === 'array' && Array.isArray(value) && schema.items && schema.items.type === 'object') {
    return value.map((row) => coerceNumbers(schema.items, row));
  }
  if ((schema.type === 'integer' || schema.type === 'number') && typeof value === 'string') {
    const text = value.trim().replace(',', '.');
    if (text === '') return undefined;
    const n = Number(text);
    return Number.isFinite(n) ? n : value;
  }
  return value;
}

/** Champs « Entier » / « Décimal » : tcomb-json-schema produit pour un entier un type `Int`
 * irréductible (pas un sous-type de `t.Number`), que tcomb-form-native ne reconnaît pas comme
 * numérique — la saisie restait du texte (« 25 ») et était refusée à la validation. On impose le
 * transformateur numérique de tcomb et le clavier numérique. Mute `fields`. */
function applyNumberInputs(fields: any, schema: any): void {
  const props = (schema && schema.properties) || {};
  Object.keys(props).forEach((key) => {
    const prop = props[key] || {};
    const f = fields && fields[key];
    if (!f) return;
    if (prop.type === 'object') applyNumberInputs(f.fields, prop);
    else if (prop.type === 'array' && prop.items && prop.items.type === 'object') {
      applyNumberInputs(f.item && f.item.fields ? f.item.fields : f.fields, prop.items);
    } else if (prop.type === 'integer' || prop.type === 'number') {
      if (!f.transformer) f.transformer = t.form.Textbox.numberTransformer;
      // « numeric » : seule valeur pour laquelle le template patché nettoie / formate la saisie.
      if (!f.keyboardType) f.keyboardType = 'numeric';
    }
  });
}

function coerceData(pages: any[], data: any[]): any[] {
  return (data || []).map((page, i) => coerceNumbers(pages[i] && pages[i].page, page));
}

function CollectFill() {
  const { t: tr } = useTranslation('coso_collect');
  const toast = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<PrivateStackParamList>>();
  const route: any = useRoute();
  const { uuid, formServerId } = route.params || {};
  const owner = useOwnerKey();
  const author = useAuthorName();
  const refForm = useRef<any>(null);

  const [form, setForm] = useState<any>(null);
  const [record, setRecord] = useState<any>(null);
  const [values, setValues] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const savedJson = useRef<string>('[]');
  const leaving = useRef(false);

  useEffect(() => {
    if (!owner) return;
    (async () => {
      const f = await getLocalForm(owner, formServerId);
      const r = await getSubmission(owner, uuid);
      if (!f || !r) { navigation.goBack(); return; }
      if (r.isLocked) { navigation.replace('CollectSubmissionView', { uuid, formServerId }); return; }
      const data = clone(r.data || []) || [];
      savedJson.current = JSON.stringify(data);
      setForm(f);
      setRecord(r);
      setValues(data);
      setPageIndex(Math.min(Math.max(r.currentPage || 0, 0), Math.max((f.form || []).length - 1, 0)));
    })();
  }, [owner, uuid, formServerId, navigation]);

  const pages: any[] = form ? (form.form || []) : [];
  const page = pages[pageIndex] || null;
  const isLast = pageIndex >= pages.length - 1;
  const formOpen = !!form && form.isOpen;
  const pageValue = values[pageIndex] || {};
  const liveKey = page && page.choicesFrom && page.choicesFrom.length ? JSON.stringify(values) : '';

  // Type tcomb de la page (enum des champs `choicesFrom` recalculé sur les réponses courantes).
  const TcombType = useMemo(() => {
    if (!page) return null;
    if (page.messages && transform.setMessages) transform.setMessages(page.messages);
    const relaxed = relaxChoicesFromSchema(page.page, page.choicesFrom, {
      currentPageIndex: pageIndex, currentPageValue: pageValue,
      task: { form: pages, form_response: values }, externalDocs: {},
    } as any);
    const type = transform(relaxed);
    if (transform.resetMessages) transform.resetMessages();
    return type;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, pageIndex, liveKey]);

  const options = useMemo(() => {
    if (!page || !TcombType) return {};
    const base = page.options || {};
    const styled = applyStyleRecursively(t, base.fields || {}, TcombType, WIDTH - 25);
    applyNumberInputs(styled, page.page);
    applyChoicesFromToOptions(page.choicesFrom, styled, {
      currentPageIndex: pageIndex, currentPageValue: pageValue,
      task: { form: pages, form_response: values }, externalDocs: {},
    } as any);
    return applyGroupTitleFactory(applyCheckListFactory(applyGeoPointFactory(
      applyMediaFactory({ ...base, fields: styled }, uuid),
    )));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TcombType, form, pageIndex, liveKey, uuid]);

  const onChange = (value: any) => {
    setValues((prev) => {
      const next = prev.slice();
      while (next.length <= pageIndex) next.push({});
      next[pageIndex] = value;
      return next;
    });
  };

  /** Enregistre localement (et lance la synchro si connecté). `status` absent = statut conservé,
   * sauf une saisie envoyée rouverte : modifiée, elle redevient un brouillon jusqu'au renvoi. */
  const persist = useCallback(async (data: any[], status?: SubmissionStatus, nextPage?: number) => {
    if (!record || !form) return;
    data = coerceData(form.form || [], data);
    const json = JSON.stringify(data);
    if (!status && json === savedJson.current) return; // rien de nouveau à enregistrer
    const finalStatus: SubmissionStatus = status || (record.status === 'submitted' ? 'draft' : record.status);
    await saveSubmissionLocally({
      record, form, data, status: finalStatus, currentPage: nextPage !== undefined ? nextPage : pageIndex, author,
    });
    savedJson.current = json;
    requestCollectSync(form.serverId);
  }, [record, form, pageIndex, author]);

  // Retour arrière (bouton / geste) : enregistre le brouillon ; une saisie ouverte puis quittée sans
  // rien renseigner (jamais synchronisée) est supprimée plutôt que gardée vide.
  useEffect(() => navigation.addListener('beforeRemove', () => {
    if (leaving.current || !record) return;
    const untouched = JSON.stringify(values) === savedJson.current;
    const empty = !values.some((v) => v && Object.keys(v).length);
    if (untouched && empty && !record.serverUpdatedAt && record.status === 'draft') {
      deleteLocalDraft(record).catch(() => undefined);
      return;
    }
    persist(values).catch(() => undefined);
  }), [navigation, persist, values, record]);

  /** Valeur validée de la page courante, ou null (champs en rouge + message). */
  const validatedPageValue = () => {
    const value = refForm.current ? refForm.current.getValue() : null;
    if (!value) {
      toast.show({ description: tr('fill_required_fields') });
      return null;
    }
    const missing = refForm.current.checkPageRequired ? refForm.current.checkPageRequired() : [];
    if (missing.length) {
      toast.show({ description: tr('fill_required_fields') });
      return null;
    }
    return clone(value);
  };

  const withPage = (value: any) => {
    const next = values.slice();
    while (next.length <= pageIndex) next.push({});
    next[pageIndex] = value;
    return next;
  };

  const goPrevious = async () => {
    const data = withPage(clone(pageValue));
    setValues(data);
    await persist(data, undefined, pageIndex - 1);
    setPageIndex(pageIndex - 1);
  };

  const goNext = async () => {
    const value = validatedPageValue();
    if (!value) return;
    const data = withPage(value);
    setValues(data);
    await persist(data, undefined, pageIndex + 1);
    setPageIndex(pageIndex + 1);
  };

  const finish = async (status: SubmissionStatus) => {
    const value = validatedPageValue();
    if (!value) return;
    if (status === 'submitted' && !formOpen) {
      Alert.alert(tr('form_closed_title'), form.closeMessage || tr('form_closed_default'));
      return;
    }
    const doSave = async () => {
      setSaving(true);
      try {
        const data = withPage(value);
        setValues(data);
        await persist(data, status, pageIndex);
        const online = await isOnline();
        toast.show({
          description: status === 'submitted'
            ? (online ? tr('record_sending') : tr('record_send_later'))
            : tr('record_saved'),
        });
        leaving.current = true;
        navigation.goBack();
      } finally {
        setSaving(false);
      }
    };
    if (status === 'submitted') {
      Alert.alert(tr('send_confirm_title'), tr('send_confirm_message'), [
        { text: tr('cancel'), style: 'cancel' },
        { text: tr('send'), onPress: doSave },
      ]);
    } else {
      doSave();
    }
  };

  /** « Enregistrer le brouillon » (bas du formulaire) : enregistre la page telle quelle, sans
   * validation, et RESTE sur la saisie (synchronisée ensuite si connecté). */
  const saveDraftHere = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const data = withPage(clone(pageValue));
      setValues(data);
      await persist(data, undefined, pageIndex);
      toast.show({ description: tr('draft_saved') });
    } finally {
      setSaving(false);
    }
  };

  const saveDraftAndExit = async () => {
    const data = withPage(clone(pageValue));
    await persist(data.length ? data : values, undefined, pageIndex);
    leaving.current = true;
    toast.show({ description: tr('draft_saved') });
    navigation.goBack();
  };

  if (!form || !record || !page || !TcombType) {
    return <View style={cs.container} />;
  }

  return (
    <View style={cs.container}>
      {!formOpen ? <ClosedBanner message={form.closeMessage || tr('form_closed_default')} /> : null}
      {record.editable ? (
        <View style={{ backgroundColor: '#f3e8ff', marginHorizontal: 16, marginTop: 8, padding: 10, borderRadius: 10 }}>
          <Text style={{ color: '#7b3fbf', fontSize: 13 }}>{tr('reopened_banner')}</Text>
        </View>
      ) : null}
      <View style={[cs.row, { paddingHorizontal: 16, paddingTop: 10, justifyContent: 'space-between' }]}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={cs.title} numberOfLines={1}>{form.title}</Text>
          <Text style={cs.muted}>{tr('page_x_of_y', { x: pageIndex + 1, y: pages.length })}</Text>
        </View>
        <TouchableOpacity style={[cs.outlineButton, { paddingVertical: 6 }]} onPress={saveDraftAndExit}>
          <Feather name="save" size={14} color={colors.primary} />
          <Text style={[cs.outlineButtonText, { fontSize: 13 }]}>{tr('save_draft')}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 4, backgroundColor: '#eef1f3', marginHorizontal: 16, marginTop: 8, borderRadius: 2 }}>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.primary, width: `${((pageIndex + 1) / pages.length) * 100}%` }} />
      </View>
      <ScrollView _contentContainerStyle={{ px: 4, pt: 4, pb: 10 }} keyboardShouldPersistTaps="handled">
        <Form
          key={`page-${pageIndex}`}
          ref={refForm}
          type={TcombType}
          options={options}
          value={pageValue}
          onChange={onChange}
          page={page}
          allResponses={values}
        />
        <View style={[cs.row, { marginTop: 12 }]}>
          {pageIndex > 0 ? (
            <TouchableOpacity style={[cs.outlineButton, { flex: 1 }, !isLast && { marginRight: 8 }]} onPress={goPrevious} disabled={saving}>
              <Feather name="chevron-left" size={16} color={colors.primary} />
              <Text style={cs.outlineButtonText}>{tr('previous')}</Text>
            </TouchableOpacity>
          ) : null}
          {!isLast ? (
            <TouchableOpacity style={[cs.primaryButton, { flex: 1 }]} onPress={goNext} disabled={saving}>
              <Text style={[cs.primaryButtonText, { marginLeft: 0, marginRight: 6 }]}>{tr('next')}</Text>
              <Feather name="chevron-right" size={16} color="white" />
            </TouchableOpacity>
          ) : null}
        </View>
        {isLast ? (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity style={[cs.outlineButton, { marginBottom: 8 }]} onPress={() => finish('completed')} disabled={saving}>
              <Feather name="check-square" size={16} color={colors.primary} />
              <Text style={cs.outlineButtonText}>{tr('save_without_sending')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[cs.primaryButton, !formOpen && { backgroundColor: '#b8c2c8' }]}
              onPress={() => finish('submitted')}
              disabled={saving}
            >
              <Feather name="send" size={16} color="white" />
              <Text style={cs.primaryButtonText}>{tr('send')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <TouchableOpacity
          style={[cs.outlineButton, { marginTop: 10 }]}
          onPress={saveDraftHere}
          disabled={saving}
        >
          <Feather name="save" size={16} color={colors.primary} />
          <Text style={cs.outlineButtonText}>{tr('save_draft_here')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export default CollectFill;
