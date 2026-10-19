/**
 * Titre combiné d'une saisie COSOCollect (le libellé qui représente un objet de données).
 *
 * Même algorithme que le serveur (cdd-backend : coso_collect/titles.py) : le mobile l'utilise pour
 * afficher une saisie pas encore synchronisée ; à la synchronisation, le titre calculé par le
 * serveur remplace celui-ci.
 *
 * Ex. canton = CINKASSE, village = CINKASSE CENTRE, enregistré le 05/10/2026 à 14:13:50
 *   -> "cinkasse_cinkasse_centre_20261005141350".
 */

export type TitlePart =
  | { type: 'field'; path: string }
  | { type: 'meta'; key: 'created_at' | 'created_date' | 'created_time' | 'author' | 'form' }
  | { type: 'text'; value: string };

export type TitleTemplate = { parts?: TitlePart[]; separator?: string; slugify?: boolean };

type FieldInfo = { type: string; choices: Record<string, string> };

const SELECT_TYPES: Record<string, 1> = { select_one: 1, select_multiple: 1, select_multiple_check: 1 };

function choicesMap(enumValue: any, opts: any): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(enumValue)) enumValue.forEach((v) => { out[String(v)] = String(v); });
  else if (enumValue && typeof enumValue === 'object') {
    Object.keys(enumValue).forEach((k) => { out[k] = String(enumValue[k]); });
  }
  (opts?.dataset || []).forEach((row: any) => {
    if (row && row.v !== undefined && row.v !== null && row.v !== '') {
      out[String(row.v)] = String(row.l !== undefined && row.l !== null && row.l !== '' ? row.l : row.v);
    }
  });
  return out;
}

export function fieldType(prop: any, opts: any): string {
  prop = prop || {};
  opts = opts || {};
  if (prop.type === 'object') return 'group';
  if (prop.type === 'array' && prop.items && prop.items.type === 'object') return 'repeat';
  if (prop.type === 'array' && prop.items && prop.items.enum) {
    return opts.mode === 'checklist' ? 'select_multiple_check' : 'select_multiple';
  }
  if (prop.enum) return 'select_one';
  if (prop.type === 'geopoint' || opts.mode === 'geopoint') return 'geopoint';
  if (prop.type === 'photo' || opts.mode === 'photo') return 'photo';
  if (prop.type === 'file' || opts.mode === 'file') return 'file';
  if (prop.type === 'integer') return 'integer';
  if (prop.type === 'number') return 'decimal';
  if (prop.format === 'date' || prop.format === 'datetime' || prop.format === 'time') return prop.format;
  if (prop._note) return 'note';
  return 'text';
}

/** Champs hors répétable indexés par chemin "$<page>.<chemin>". */
export function fieldsByPath(form: any[]): Record<string, FieldInfo> {
  const out: Record<string, FieldInfo> = {};
  const walk = (props: any, fields: any, prefix: string) => {
    Object.keys(props || {}).forEach((key) => {
      const prop = props[key] || {};
      const opts = (fields || {})[key] || {};
      const path = `${prefix}.${key}`;
      const type = fieldType(prop, opts);
      if (type === 'group') walk(prop.properties, opts.fields, path);
      else if (type !== 'repeat') {
        const enumValue = type === 'select_one' ? prop.enum : (prop.items || {}).enum;
        out[path] = { type, choices: SELECT_TYPES[type] ? choicesMap(enumValue, opts) : {} };
      }
    });
  };
  (form || []).forEach((page: any, i: number) => {
    walk(page?.page?.properties, page?.options?.fields, `$${i}`);
  });
  return out;
}

export function resolveValue(data: any[], path: string): any {
  if (typeof path !== 'string' || path[0] !== '$') return undefined;
  const [head, ...rest] = path.slice(1).split('.');
  let cur: any = Array.isArray(data) ? data[Number(head)] : undefined;
  for (const part of rest) {
    if (cur && typeof cur === 'object' && !Array.isArray(cur)) cur = cur[part];
    else return undefined;
  }
  return cur;
}

export function slugifyPiece(value: any): string {
  let s = String(value === undefined || value === null ? '' : value);
  if (s.normalize) s = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

const pad2 = (n: number) => (n < 10 ? '0' : '') + n;

/** "2026-10-05T14:13:50+01:00" -> champs de l'heure « murale » écrite dans la chaîne (pas de
 * conversion de fuseau), comme datetime.fromisoformat côté serveur. */
function wallClock(iso: string): { y: string; mo: string; d: string; h: string; mi: string; s: string } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(String(iso || ''));
  if (!m) return null;
  return { y: m[1], mo: m[2], d: m[3], h: m[4] || '00', mi: m[5] || '00', s: m[6] || '00' };
}

/** Date d'enregistrement en heure locale avec son fuseau (base du titre combiné). */
export function localIsoString(d: Date = new Date()): string {
  let off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  off = Math.abs(off);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}${sign}${pad2(Math.floor(off / 60))}:${pad2(off % 60)}`;
}

function fieldDisplay(field: FieldInfo | undefined, value: any): string {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) return '';
  const type = field ? field.type : 'text';
  if (SELECT_TYPES[type]) {
    const values = Array.isArray(value) ? value : [value];
    return values.filter((v) => v !== undefined && v !== null && v !== '')
      .map((v) => (field!.choices[String(v)] !== undefined ? field!.choices[String(v)] : String(v))).join(' ');
  }
  if (type === 'date' || type === 'datetime' || type === 'time') {
    // Valeur stockée par tcomb = Date sérialisée en UTC (toJSON) : même lecture que le serveur.
    const iso = value instanceof Date ? value.toISOString() : String(value);
    const w = wallClock(iso);
    if (!w) return String(value);
    if (type === 'date') return w.y + w.mo + w.d;
    if (type === 'time') return w.h + w.mi + w.s;
    return w.y + w.mo + w.d + w.h + w.mi + w.s;
  }
  if (type === 'geopoint' && typeof value === 'object') {
    const lat = Number(value.latitude);
    const lng = Number(value.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(5)} ${lng.toFixed(5)}` : '';
  }
  if ((type === 'photo' || type === 'file') && typeof value === 'object') return String(value.name || '');
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') return '';
  return String(value);
}

function metaDisplay(key: string, createdIso: string, author: string, formTitle: string): string {
  if (key === 'created_at' || key === 'created_date' || key === 'created_time') {
    const w = wallClock(createdIso);
    if (!w) return '';
    if (key === 'created_date') return w.y + w.mo + w.d;
    if (key === 'created_time') return w.h + w.mi + w.s;
    return w.y + w.mo + w.d + w.h + w.mi + w.s;
  }
  if (key === 'author') return author || '';
  if (key === 'form') return formTitle || '';
  return '';
}

export function computeCollectTitle(params: {
  form: any[];
  template: TitleTemplate | null | undefined;
  data: any[];
  createdAt: string;
  author?: string;
  formTitle?: string;
}): string {
  const template = params.template || {};
  const parts = Array.isArray(template.parts) ? template.parts : [];
  const separator = template.separator === undefined || template.separator === null ? '_' : String(template.separator);
  const doSlug = template.slugify !== false;
  const byPath = fieldsByPath(params.form);
  const author = params.author || '';
  const formTitle = params.formTitle || '';

  let pieces: string[] = [];
  let hasFieldPart = false;
  let hasFieldValue = false;
  parts.forEach((part: any) => {
    let text = '';
    if (part.type === 'field') {
      hasFieldPart = true;
      text = fieldDisplay(byPath[part.path], resolveValue(params.data, part.path));
      hasFieldValue = hasFieldValue || !!text;
    } else if (part.type === 'meta') {
      text = metaDisplay(part.key, params.createdAt, author, formTitle);
    } else if (part.type === 'text') {
      text = String(part.value || '');
    }
    text = doSlug ? slugifyPiece(text) : text.trim();
    if (text) pieces.push(text);
  });
  if (!pieces.length || (hasFieldPart && !hasFieldValue)) {
    const base = doSlug ? slugifyPiece(formTitle) : formTitle.trim();
    pieces = [base, metaDisplay('created_at', params.createdAt, author, formTitle)].filter(Boolean);
  }
  return pieces.join(separator).slice(0, 500);
}
