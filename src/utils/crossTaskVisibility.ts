// Visibilité conditionnelle d'UN CHAMP (dans le formulaire d'une tâche) ou
// d'UNE TÂCHE ENTIÈRE (liste des tâches, ActivityDetail.tsx), pilotée par la
// valeur d'un champ répondu dans une AUTRE tâche (toujours — le same-task/
// cross-page reste couvert par le moteur `rules` existant, cf.
// tcomb-form-native/lib/cdd-form-logic.js). Configuré côté web (form builder),
// `page["crossTaskVisibility"]` (portée champ) et `Task.visibility_condition`
// (portée tâche entière, hors de `form`).
//
// Résolu ENTIÈREMENT ICI (pas de patch tcomb-form-native) : le moteur
// `cdd-form-logic.js` est 100% synchrone (appelé à chaque frappe) et ne peut
// pas faire de lecture CouchDB inter-tâches — même contrainte, même solution
// que `choicesFrom.ts` (dont ce fichier reprend volontairement les petits
// helpers purs plutôt que de les importer, cf. son en-tête).

export interface CrossTaskVisibilityEntry {
  path?: string; // absent pour la portée "tâche entière" (cible implicite)
  sourceTaskId: number;
  sourcePath: string; // toujours "$<pageIndex>.<chemin>" — toujours inter-tâches
  op: string;
  value: any;
  action: 'show' | 'hide';
  defaultWhenUnknown: 'visible' | 'hidden';
}

interface TaskLike {
  form_response?: any[];
}

// Même logique que `resolvePath` de choicesFrom.ts / cdd-form-logic.js
// (dupliquée à dessein — 8 lignes triviales).
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

// "$<index>.<chemin>" -> {pageIndex, rest} ; ce mécanisme est TOUJOURS
// inter-tâches, donc toujours de cette forme (contrairement à choicesFrom.ts,
// pas de cas "chemin nu" à gérer ici).
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
// (dupliqué à dessein, même raisonnement que `resolvePath` ci-dessus — ce
// fichier n'a pas besoin, et ne doit pas dépendre, du reste du moteur `rules`
// du fork patché).
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

// Évaluateur central, réutilisé par les 2 portées (champ / tâche entière) :
// renvoie `true` si la cible doit être VISIBLE.
// - `entry` absent -> toujours visible (pas de condition configurée).
// - `sourceDoc` absent (tâche source jamais synchronisée/trouvée localement)
//   OU valeur résolue vide (source pas encore répondue) -> `defaultWhenUnknown`
//   (réglage choisi dans le builder, pas une valeur figée dans le code).
// - Sinon : condition évaluée normalement, `action` détermine le sens.
export function evaluateCrossTaskCondition(
  entry: CrossTaskVisibilityEntry | null | undefined,
  sourceDoc: TaskLike | null | undefined,
): boolean {
  if (!entry) return true;
  const { pageIndex, rest } = parseSourcePath(entry.sourcePath);
  const resolved = (sourceDoc && pageIndex != null)
    ? resolvePath((sourceDoc.form_response || [])[pageIndex], rest)
    : undefined;

  if (!sourceDoc || pageIndex == null || isEmpty(resolved)) {
    return entry.defaultWhenUnknown === 'visible';
  }

  const met = evaluateOp(entry.op, resolved, entry.value);
  return entry.action === 'show' ? met : !met;
}

// Descend un chemin pointé (groupes compris) dans un arbre `options.fields` —
// dupliqué de choicesFrom.ts (même parcours groupes/répétables).
function descendOptionsFields(fieldsOptions: any, path: string): any {
  const parts = String(path).split('.');
  let cur = fieldsOptions;
  for (let i = 0; i < parts.length; i++) {
    if (!cur || typeof cur !== 'object') return null;
    const node = cur[parts[i]];
    if (!node) return null;
    if (i === parts.length - 1) return node;
    cur = node.fields || (node.item && node.item.fields);
  }
  return null;
}

// Portée CHAMP : pose `.hidden` sur chaque champ cible — mutation en place,
// même convention que `applyChoicesFromToOptions`/`applyDatasets`. Le tcomb
// patché (`Struct.validate()`/`List.validate()`) exclut déjà génériquement
// tout ref dont `options.fields.<ref>.hidden` est vrai, quelle que soit son
// origine — aucun nouveau patch nécessaire ici.
export function applyCrossTaskVisibilityToOptions(
  entries: CrossTaskVisibilityEntry[] | undefined,
  fieldsOptions: any,
  sourceDocsByTaskId: { [taskId: number]: TaskLike | null | undefined },
): void {
  if (!Array.isArray(entries) || !entries.length || !fieldsOptions) return;
  entries.forEach((entry) => {
    if (!entry || !entry.path) return;
    const target = descendOptionsFields(fieldsOptions, entry.path);
    if (!target) return;
    target.hidden = !evaluateCrossTaskCondition(entry, sourceDocsByTaskId[entry.sourceTaskId]);
  });
}

// Portée TÂCHE ENTIÈRE : `true` = la tâche doit apparaître dans la liste.
export function resolveWholeTaskVisibility(
  visibilityCondition: CrossTaskVisibilityEntry | null | undefined,
  sourceDoc: TaskLike | null | undefined,
): boolean {
  return evaluateCrossTaskCondition(visibilityCondition, sourceDoc);
}

export function externalTaskIdsForCrossTaskVisibility(entries: CrossTaskVisibilityEntry[] | undefined): number[] {
  if (!Array.isArray(entries)) return [];
  const ids = new Set<number>();
  entries.forEach((entry) => { if (entry && entry.sourceTaskId) ids.add(entry.sourceTaskId); });
  return Array.from(ids);
}

export function externalTaskIdForVisibilityCondition(cond: CrossTaskVisibilityEntry | null | undefined): number[] {
  return cond && cond.sourceTaskId ? [cond.sourceTaskId] : [];
}
