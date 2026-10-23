/**
 * Accès à la base locale COSOCollect (WatermelonDB) : formulaires chargés et saisies.
 * Toutes les lectures/écritures sont restreintes au compte connecté (`owner_key`).
 */
import { Q } from '@nozbe/watermelondb';
import * as FileSystem from 'expo-file-system';

import { collectDatabase, CollectForm, CollectSubmission } from '../../database/collect';
import { computeCollectTitle, localIsoString } from '../../utils/collectTitle';
import type { CollectFormDefinition, CollectFormSummary, ServerSubmission } from './api';

export type SubmissionStatus = 'draft' | 'completed' | 'submitted';

const forms = () => collectDatabase.get<any>('collect_forms');
const submissions = () => collectDatabase.get<any>('collect_submissions');

export function newUuid(): string {
  // RFC 4122 v4 (Math.random suffit : unicité, pas de secret).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// ------------------------------------------------------------------------------------ compte
/** Données rangées sous une ancienne clé du même compte (identifiant tapé : nom d'utilisateur ou e-mail)
 * reprises sous sa clé stable `owner`. Sans cela, se reconnecter avec l'autre identifiant masquait les
 * formulaires et les saisies déjà sur l'appareil, et les saisies pas encore envoyées ne partaient plus.
 * Doublons (même formulaire / même saisie sous les deux clés) : on garde la saisie modifiée localement,
 * sinon celle déjà sous la clé stable. */
export async function adoptOwnerAliases(owner: string, aliases: string[]): Promise<number> {
  const keys = aliases.filter((k) => k && k !== owner);
  if (!owner || !keys.length) return 0;
  const oldForms = await forms().query(Q.where('owner_key', Q.oneOf(keys))).fetch();
  const oldSubmissions = await submissions().query(Q.where('owner_key', Q.oneOf(keys))).fetch();
  if (!oldForms.length && !oldSubmissions.length) return 0;
  const ownForms = await forms().query(Q.where('owner_key', owner)).fetch();
  const ownSubmissions = await submissions().query(Q.where('owner_key', owner)).fetch();

  const ops: any[] = [];
  const formIds = new Set(ownForms.map((f: any) => f.serverId));
  for (const form of oldForms) {
    if (formIds.has(form.serverId)) ops.push(form.prepareDestroyPermanently());
    else {
      formIds.add(form.serverId);
      ops.push(form.prepareUpdate((rec: any) => { rec.ownerKey = owner; }));
    }
  }
  const byUuid = new Map<string, any>(ownSubmissions.map((s: any) => [s.uuid, s]));
  for (const sub of oldSubmissions) {
    const kept = byUuid.get(sub.uuid);
    if (kept && (kept.dirty || !sub.dirty)) {
      ops.push(sub.prepareDestroyPermanently());
      continue;
    }
    if (kept) ops.push(kept.prepareDestroyPermanently());
    byUuid.set(sub.uuid, sub);
    ops.push(sub.prepareUpdate((rec: any) => { rec.ownerKey = owner; }));
  }
  await collectDatabase.write(async () => { await collectDatabase.batch(...ops); });
  return oldForms.length + oldSubmissions.length;
}

// ------------------------------------------------------------------------------------- formulaires
export function observeLocalForms(owner: string) {
  return forms().query(Q.where('owner_key', owner)).observe();
}

export async function getLocalForms(owner: string): Promise<any[]> {
  return forms().query(Q.where('owner_key', owner)).fetch();
}

export async function getLocalForm(owner: string, serverId: number): Promise<any | null> {
  const rows = await forms().query(Q.where('owner_key', owner), Q.where('server_id', serverId)).fetch();
  return rows[0] || null;
}

export function observeLocalForm(owner: string, serverId: number) {
  return forms().query(Q.where('owner_key', owner), Q.where('server_id', serverId)).observe();
}

/** Enregistre (ou met à jour) la définition complète d'un formulaire. */
export async function saveFormDefinition(owner: string, def: CollectFormDefinition): Promise<any> {
  const existing = await getLocalForm(owner, def.id);
  return collectDatabase.write(async () => {
    const apply = (rec: any) => {
      rec.ownerKey = owner;
      rec.serverId = def.id;
      rec.uid = def.uid;
      rec.title = def.title || '';
      rec.description = def.description || '';
      rec.version = def.version || 1;
      rec.status = def.status;
      rec.closeMessage = def.close_message || '';
      rec.singleSubmission = !!def.single_submission;
      rec.form = def.form || [];
      rec.titleTemplate = def.title_template || {};
      rec.publishedAt = def.published_at || '';
      if (!rec.downloadedAt) rec.downloadedAt = Date.now();
    };
    if (existing) {
      await existing.update(apply);
      return existing;
    }
    return forms().create(apply);
  });
}

/** Statut / message de clôture / réglage « un seul enregistrement » reçus du serveur sans recharger toute
 * la définition. */
export async function applyFormSummary(owner: string, summary: CollectFormSummary): Promise<void> {
  const local = await getLocalForm(owner, summary.id);
  if (!local) return;
  const single = !!summary.single_submission;
  if (local.status === summary.status && local.closeMessage === (summary.close_message || '')
    && !!local.singleSubmission === single) return;
  await collectDatabase.write(async () => {
    await local.update((rec: any) => {
      rec.status = summary.status;
      rec.closeMessage = summary.close_message || '';
      rec.singleSubmission = single;
    });
  });
}

export async function markFormSynced(owner: string, serverId: number, serverTimeMs: number): Promise<void> {
  const local = await getLocalForm(owner, serverId);
  if (!local) return;
  await collectDatabase.write(async () => {
    await local.update((rec: any) => { rec.lastSyncedAt = serverTimeMs; });
  });
}

/** Retire un formulaire de l'appareil (refusé s'il reste des saisies non synchronisées). */
export async function removeLocalForm(owner: string, serverId: number): Promise<boolean> {
  const local = await getLocalForm(owner, serverId);
  if (!local) return true;
  const rows = await submissions().query(Q.where('owner_key', owner), Q.where('form_server_id', serverId)).fetch();
  if (rows.some((r: any) => r.dirty)) return false;
  await collectDatabase.write(async () => {
    await collectDatabase.batch(...rows.map((r: any) => r.prepareDestroyPermanently()), local.prepareDestroyPermanently());
  });
  rows.forEach((r: any) => { deleteLocalFiles(r.uuid); });
  return true;
}

// ----------------------------------------------------------------------------------------- saisies
export function observeSubmissions(owner: string, formServerId: number) {
  return submissions().query(Q.where('owner_key', owner), Q.where('form_server_id', formServerId)).observe();
}

export function observeAllSubmissions(owner: string) {
  return submissions().query(Q.where('owner_key', owner)).observe();
}

export async function getSubmission(owner: string, uuid: string): Promise<any | null> {
  const rows = await submissions().query(Q.where('owner_key', owner), Q.where('uuid', uuid)).fetch();
  return rows[0] || null;
}

export async function getDirtySubmissions(owner: string, formServerId?: number): Promise<any[]> {
  const clauses: any[] = [Q.where('owner_key', owner), Q.where('dirty', true)];
  if (formServerId !== undefined) clauses.push(Q.where('form_server_id', formServerId));
  return submissions().query(...clauses).fetch();
}

function titleFor(form: any, data: any[], createdAt: string, author: string) {
  return computeCollectTitle({
    form: form.form, template: form.titleTemplate, data, createdAt, author, formTitle: form.title,
  });
}

export async function createSubmission(owner: string, form: any, author: string): Promise<any> {
  const createdAt = localIsoString(new Date());
  return collectDatabase.write(async () => submissions().create((rec: any) => {
    rec.ownerKey = owner;
    rec.uuid = newUuid();
    rec.formServerId = form.serverId;
    rec.formVersion = form.version;
    rec.data = [];
    rec.status = 'draft';
    rec.title = titleFor(form, [], createdAt, author);
    rec.editable = false;
    rec.dirty = true;
    rec.createdAtLocal = createdAt;
    rec.currentPage = 0;
    rec.source = 'mobile';
  }));
}

/** Photos / fichiers : `attachment_id` (et taille) déjà obtenus par la synchronisation pour un fichier
 * local (`local_uri`) -> reportés dans `data`. L'écran de saisie garde en mémoire la valeur d'AVANT
 * l'envoi du fichier (la synchro, en arrière-plan, n'écrit que dans la base locale) : sans ce report,
 * l'enregistrement suivant (page suivante, « Enregistrer le brouillon ») effaçait l'identifiant -> le
 * fichier repartait une seconde fois et le serveur supprimait le premier, devenu orphelin. */
export function keepAttachmentIds(data: any, previous: any): any {
  const known = new Map<string, any>();
  const collect = (v: any) => {
    if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === 'object') {
      if (v.local_uri && v.attachment_id) known.set(v.local_uri, v);
      else Object.keys(v).forEach((k) => collect(v[k]));
    }
  };
  collect(previous);
  if (!known.size) return data;
  const apply = (v: any): any => {
    if (Array.isArray(v)) return v.map(apply);
    if (v && typeof v === 'object') {
      if (v.local_uri && !v.attachment_id && known.has(v.local_uri)) {
        const sent = known.get(v.local_uri);
        return { ...v, attachment_id: sent.attachment_id, size: v.size || sent.size };
      }
      const out: any = {};
      Object.keys(v).forEach((k) => { out[k] = apply(v[k]); });
      return out;
    }
    return v;
  };
  return apply(data);
}

/** Enregistre localement la saisie (brouillon, remplie ou envoyée) : à synchroniser ensuite. */
export async function saveSubmissionLocally(params: {
  record: any; form: any; data: any[]; status: SubmissionStatus; currentPage: number; author: string;
}): Promise<void> {
  const { record, form, status, currentPage, author } = params;
  await collectDatabase.write(async () => {
    // Lu DANS l'écriture (les écritures sont sérialisées) : dernière valeur écrite par la synchro.
    const data = keepAttachmentIds(params.data, record.data);
    await record.update((rec: any) => {
      rec.data = data;
      rec.status = status;
      rec.formVersion = form.version;
      rec.currentPage = currentPage;
      rec.dirty = true;
      rec.syncErrorCode = null;
      rec.syncError = null;
      if (status === 'submitted') rec.submittedAtLocal = localIsoString(new Date());
      // Titre provisoire : le serveur renvoie le sien à la synchronisation.
      rec.title = titleFor(form, data, rec.createdAtLocal, author);
    });
  });
}

/** Une saisie jamais reçue par le serveur peut être supprimée de l'appareil : brouillon, ou saisie refusée
 * parce que le formulaire n'accepte qu'un enregistrement par personne (même si elle était « envoyée »). */
export function canDeleteLocally(record: any): boolean {
  if (record.serverUpdatedAt) return false;
  return record.status !== 'submitted' || record.syncErrorCode === 'single_submission';
}

/** Supprime une saisie jamais synchronisée (brouillon resté sur l'appareil). */
export async function deleteLocalDraft(record: any): Promise<boolean> {
  if (!canDeleteLocally(record)) return false;
  await collectDatabase.write(async () => { await record.destroyPermanently(); });
  deleteLocalFiles(record.uuid);
  return true;
}

export async function updateSubmissionData(record: any, data: any[]): Promise<void> {
  await collectDatabase.write(async () => {
    await record.update((rec: any) => { rec.data = data; });
  });
}

export async function markSyncError(record: any, code: string, message: string): Promise<void> {
  await collectDatabase.write(async () => {
    await record.update((rec: any) => {
      rec.syncErrorCode = code;
      rec.syncError = message;
    });
  });
}

/** Valeurs photo/fichier de `previous` encore présentes sur l'appareil, conservées dans `server`
 * (même pièce jointe) pour que l'image reste affichable hors connexion. */
function keepLocalUris(server: any, previous: any): any {
  if (Array.isArray(server)) return server.map((v, i) => keepLocalUris(v, Array.isArray(previous) ? previous[i] : undefined));
  if (server && typeof server === 'object') {
    if (server.attachment_id && previous && previous.attachment_id === server.attachment_id && previous.local_uri) {
      return { ...server, local_uri: previous.local_uri };
    }
    const out: any = {};
    Object.keys(server).forEach((k) => {
      out[k] = keepLocalUris(server[k], previous && typeof previous === 'object' ? previous[k] : undefined);
    });
    return out;
  }
  return server;
}

/** Copie serveur d'une saisie appliquée localement. `force` : écrase même une saisie modifiée
 * localement (cas d'une saisie verrouillée côté serveur). */
export async function applyServerSubmission(owner: string, server: ServerSubmission, force = false): Promise<void> {
  const existing = await getSubmission(owner, server.uuid);
  if (existing && existing.dirty && !force) return;
  await collectDatabase.write(async () => {
    const apply = (rec: any) => {
      rec.ownerKey = owner;
      rec.uuid = server.uuid;
      rec.formServerId = server.form_id;
      rec.formVersion = server.form_version || 1;
      rec.data = existing ? keepLocalUris(server.data || [], existing.data) : (server.data || []);
      rec.status = server.status;
      rec.title = server.title || rec.title || '';
      rec.editable = !!server.editable;
      rec.dirty = false;
      rec.syncErrorCode = force && existing && existing.dirty ? 'locked' : null;
      rec.syncError = null;
      rec.createdAtLocal = server.created_at || rec.createdAtLocal || '';
      rec.submittedAtLocal = server.submitted_at || null;
      rec.serverUpdatedAt = server.updated_at || null;
      if (rec.currentPage === undefined || rec.currentPage === null) rec.currentPage = 0;
      rec.source = server.source || 'mobile';
    };
    if (existing) await existing.update(apply);
    else await submissions().create(apply);
  });
}

/** Après un envoi accepté : la copie serveur fait foi, sauf si l'utilisateur a modifié la saisie
 * entre-temps (`localUpdatedAt` différent) — elle repartira alors à la prochaine synchronisation. */
export async function acknowledgeSubmission(record: any, server: ServerSubmission, localUpdatedAt: number): Promise<void> {
  await collectDatabase.write(async () => {
    const changedMeanwhile = record.updatedAt && record.updatedAt.getTime() !== localUpdatedAt;
    await record.update((rec: any) => {
      rec.title = server.title || rec.title;
      rec.editable = !!server.editable;
      rec.serverUpdatedAt = server.updated_at || null;
      rec.syncErrorCode = null;
      rec.syncError = null;
      if (!changedMeanwhile) {
        rec.status = server.status;
        rec.dirty = false;
      }
    });
  });
}

// ------------------------------------------------------------------------------------ fichiers locaux
const FILES_DIR = `${FileSystem.documentDirectory}cosocollect/`;

/** Copie un fichier choisi (appareil photo, galerie, document) dans le stockage de l'application :
 * les fichiers temporaires du sélecteur peuvent disparaître avant la synchronisation. */
export async function persistLocalFile(submissionUuid: string, uri: string, name: string): Promise<string> {
  const dir = `${FILES_DIR}${submissionUuid}/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => undefined);
  const safe = String(name || 'fichier').replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);
  const target = `${dir}${Date.now()}_${safe}`;
  await FileSystem.copyAsync({ from: uri, to: target });
  return target;
}

export function deleteLocalFiles(submissionUuid: string): void {
  FileSystem.deleteAsync(`${FILES_DIR}${submissionUuid}/`, { idempotent: true }).catch(() => undefined);
}

export function nowIso(): string {
  return localIsoString(new Date());
}
