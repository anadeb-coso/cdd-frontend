// Conditionnement (affichage + obligation) d'une pièce jointe de tâche
// (`Task.attachments[i]`, slot kobocollect-style {name,type,optional,order,
// conditions?}), piloté par la valeur d'un champ — soit de LA MÊME tâche
// (`sourceTaskId: null`, résolu localement contre `task.form_response`,
// aucune lecture réseau), soit d'une AUTRE tâche (même mécanisme que
// `crossTaskVisibility.ts`, dont ce fichier reprend volontairement les
// petits helpers purs plutôt que de les importer, cf. son en-tête).
//
// Contrairement à `crossTaskVisibility.ts` (uniquement show/hide), une
// condition d'attachment peut aussi rendre le slot obligatoire/facultatif
// (`require`/`optional`) — vocabulaire déjà utilisé par le moteur `rules`
// (cdd-form-logic.js), agrégé ici avec exactement la même précédence que
// `buildDynamicOptions` (hide l'emporte sur show ; require l'emporte sur
// optional sauf si optional est AUSSI satisfaite).

export interface AttachmentCondition {
  sourceTaskId: number | null; // null = champ de LA MÊME tâche
  sourcePath: string; // toujours "$<pageIndex>.<chemin>"
  op: string;
  value: any;
  action: 'show' | 'hide' | 'require' | 'optional';
  defaultWhenUnknown: 'visible' | 'hidden';
}

export interface AttachmentSlot {
  name: string;
  type: string;
  optional: boolean;
  order: number;
  conditions?: AttachmentCondition[];
  // Champs déjà écrits par l'écran au fil de la capture (non gérés ici) :
  attachment?: any;
  server_url?: any;
  [key: string]: any;
}

interface TaskLike {
  form_response?: any[];
}

// Même logique que `resolvePath` de choicesFrom.ts/crossTaskVisibility.ts
// (dupliquée à dessein — quelques lignes triviales).
function resolvePath(root: any, path: string): any {
  if (!path) return undefined;
  const parts = String(path).split('.');
  let cur = root;
  for (let i = 0; i < parts.length; i++) {
    if (cur == null) return undefined;
    cur = cur[parts[i]];
  }
  return cur;
}

// "$<index>.<chemin>" -> {pageIndex, rest} — toujours de cette forme ici,
// que la source soit la même tâche ou une autre (cf. form_design.py
// `_valid_cross_task_source_path`, réutilisé pour les 2 cas côté validation).
function parseSourcePath(sourcePath: string): { pageIndex: number | null; rest: string } {
  if (!sourcePath || sourcePath.charAt(0) !== '$') return { pageIndex: null, rest: '' };
  const dot = sourcePath.indexOf('.');
  const idx = parseInt(sourcePath.slice(1, dot === -1 ? undefined : dot), 10);
  const rest = dot === -1 ? '' : sourcePath.slice(dot + 1);
  return { pageIndex: isNaN(idx) ? null : idx, rest };
}

function isEmpty(v: any): boolean {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

function toNumber(v: any): number {
  if (typeof v === 'number') return v;
  const n = parseFloat(v);
  return isNaN(n) ? NaN : n;
}

// Même vocabulaire/sémantique que `evaluateCondition` de cdd-form-logic.js
// (dupliqué à dessein, même raisonnement que `resolvePath` ci-dessus).
function evaluateOp(op: string, actual: any, expected: any): boolean {
  switch (op) {
    case 'eq': return String(actual) === String(expected);
    case 'ne': return String(actual) !== String(expected);
    case 'gt': return toNumber(actual) > toNumber(expected);
    case 'gte': return toNumber(actual) >= toNumber(expected);
    case 'lt': return toNumber(actual) < toNumber(expected);
    case 'lte': return toNumber(actual) <= toNumber(expected);
    case 'in':
      return Array.isArray(actual)
        ? actual.map(String).indexOf(String(expected)) !== -1
        : String(actual) === String(expected);
    case 'nin':
      return Array.isArray(actual)
        ? actual.map(String).indexOf(String(expected)) === -1
        : String(actual) !== String(expected);
    case 'contains':
      return String(actual == null ? '' : actual).indexOf(String(expected)) !== -1;
    case 'empty': return isEmpty(actual);
    case 'notEmpty': return !isEmpty(actual);
    default: return true;
  }
}

// Résout la valeur source d'une condition : MÊME tâche (`sourceTaskId=null`)
// contre `sameTaskResponses` (= `task.form_response`, déjà en mémoire à
// l'écran — aucune I/O), ou AUTRE tâche contre le doc déjà pré-chargé par
// l'écran (`sourceDocsByTaskId`). `known=false` = source pas encore répondue
// (même tâche) ou tâche pas encore synchronisée localement (autre tâche).
function resolveConditionValue(
  cond: AttachmentCondition,
  sameTaskResponses: any[] | undefined,
  sourceDocsByTaskId: { [taskId: number]: TaskLike | null | undefined },
): { known: boolean; value: any } {
  const { pageIndex, rest } = parseSourcePath(cond.sourcePath);
  if (pageIndex == null) return { known: false, value: undefined };

  if (cond.sourceTaskId == null) {
    const resolved = resolvePath((sameTaskResponses || [])[pageIndex], rest);
    return { known: !isEmpty(resolved), value: resolved };
  }

  const sourceDoc = sourceDocsByTaskId[cond.sourceTaskId];
  const resolved = sourceDoc ? resolvePath((sourceDoc.form_response || [])[pageIndex], rest) : undefined;
  return { known: !!sourceDoc && !isEmpty(resolved), value: resolved };
}

// `true` = condition SATISFAITE. Tant que la source est inconnue, le
// résultat "satisfaite ou non" dépend À LA FOIS de `defaultWhenUnknown` ET de
// `action` : contrairement à `crossTaskVisibility.ts` (qui ne connaît que
// show/hide et peut donc renvoyer directement `defaultWhenUnknown ===
// 'visible'` comme résultat final), ici il faut d'abord déterminer le
// booléen "satisfaite" qui, une fois passé dans l'agrégation par action
// (cf. `evaluateAttachmentConditions`), PRODUIT l'effet voulu par
// `defaultWhenUnknown` :
// - `hide`/`require` sont les actions "restrictives" (une condition
//   satisfaite RESTREINT : cache, ou rend obligatoire) -> `defaultWhenUnknown
//   === 'hidden'` doit donner "satisfaite" (déclenche la restriction tant
//   que la source est inconnue, posture prudente par défaut).
// - `show`/`optional` sont les actions "permissives" (une condition
//   satisfaite RELÂCHE : affiche, ou rend facultatif) -> c'est l'inverse,
//   `defaultWhenUnknown === 'visible'` doit donner "satisfaite".
function isConditionMet(
  cond: AttachmentCondition,
  sameTaskResponses: any[] | undefined,
  sourceDocsByTaskId: { [taskId: number]: TaskLike | null | undefined },
): boolean {
  const { known, value } = resolveConditionValue(cond, sameTaskResponses, sourceDocsByTaskId);
  if (!known) {
    const isRestrictiveAction = cond.action === 'hide' || cond.action === 'require';
    return isRestrictiveAction
      ? cond.defaultWhenUnknown === 'hidden'
      : cond.defaultWhenUnknown === 'visible';
  }
  return evaluateOp(cond.op, value, cond.value);
}

export interface AttachmentConditionResult {
  hidden: boolean;
  required: boolean;
}

// Agrège TOUTES les conditions d'un slot — copie fidèle de la précédence déjà
// en place dans `buildDynamicOptions` (cdd-form-logic.js:292-317) :
// - hidden = (une condition "hide" satisfaite) || (des conditions "show"
//   existent et AUCUNE n'est satisfaite)
// - required = (une "require" satisfaite) && !(une "optional" satisfaite),
//   SEULEMENT si des conditions require/optional existent ; sinon repli sur
//   le flag statique `slot.optional` (comportement historique, rétro-
//   compatible à 100% avec les slots sans `conditions`).
export function evaluateAttachmentConditions(
  slot: AttachmentSlot,
  sameTaskResponses: any[] | undefined,
  sourceDocsByTaskId: { [taskId: number]: TaskLike | null | undefined },
): AttachmentConditionResult {
  const conditions = Array.isArray(slot.conditions) ? slot.conditions : [];
  const buckets: { [action: string]: boolean[] } = {};
  conditions.forEach((cond) => {
    if (!cond || !cond.action) return;
    const met = isConditionMet(cond, sameTaskResponses, sourceDocsByTaskId);
    (buckets[cond.action] || (buckets[cond.action] = [])).push(met);
  });

  const some = (a?: boolean[]) => Array.isArray(a) && a.some(Boolean);
  const has = (k: string) => Array.isArray(buckets[k]) && buckets[k].length > 0;

  let hidden = false;
  if (has('show') || has('hide')) {
    const hiddenByHide = has('hide') && some(buckets.hide);
    const hiddenByShow = has('show') && !some(buckets.show);
    hidden = hiddenByHide || hiddenByShow;
  }

  let required = !slot.optional;
  if (has('require') || has('optional')) {
    required = has('require') && some(buckets.require) && !(has('optional') && some(buckets.optional));
  }

  return { hidden, required };
}

// Tâches source à pré-charger pour résoudre les conditions "autre tâche" de
// cette liste d'attachments (mirroir de `externalTaskIdsForCrossTaskVisibility`).
export function externalTaskIdsForAttachmentConditions(attachments: AttachmentSlot[] | undefined): number[] {
  if (!Array.isArray(attachments)) return [];
  const ids = new Set<number>();
  attachments.forEach((slot) => {
    (slot.conditions || []).forEach((cond) => {
      if (cond && cond.sourceTaskId != null) ids.add(cond.sourceTaskId);
    });
  });
  return Array.from(ids);
}
