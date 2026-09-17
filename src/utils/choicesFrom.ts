// Options dynamiques d'un select_one/select_multiple construites à partir
// de la réponse (déjà saisie) d'un AUTRE select_one/select_multiple — même
// page, autre page de la même tâche, ou champ d'une tâche complètement
// différente (form builder web, `page["choicesFrom"]`). Résolu entièrement
// ICI (pas de patch tcomb-form-native) : les composants Select/List de
// tcomb-form-native lisent simplement `options.fields[x].options` /
// `.item.options`, un tableau déjà résolu `[{value,text}]` — il suffit de le
// calculer avant de construire `options` (cf. screens/TaskDetail(Test).tsx).

export interface ChoicesFromEntry {
  path: string;
  sourceTaskId: number | null;
  sourcePath: string;
}

export interface ChoiceOption {
  value: string;
  text: string;
}

interface TaskLike {
  form?: any[];
  form_response?: any[];
}

// Même logique que `resolvePath` de tcomb-form-native/lib/cdd-form-logic.js
// (dupliquée à dessein : 8 lignes triviales, évite de dépendre du fork pour
// un utilitaire mobile-only qui n'a pas besoin du reste du moteur `rules`).
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

// `"$<index>.<chemin>"` -> autre page (même convention que `rules`/`when.field`
// et `cascadeFrom`) ; chemin nu -> page courante (`pageIndex: null`).
function parseSourcePath(sourcePath: string): { pageIndex: number | null; rest: string } {
  if (sourcePath && sourcePath.charAt(0) === '$') {
    const dot = sourcePath.indexOf('.');
    const idx = parseInt(sourcePath.slice(1, dot === -1 ? undefined : dot), 10);
    const rest = dot === -1 ? '' : sourcePath.slice(dot + 1);
    return { pageIndex: isNaN(idx) ? null : idx, rest };
  }
  return { pageIndex: null, rest: sourcePath };
}

// Descend un chemin pointé (groupes compris) dans un arbre `options.fields`
// — même structure que celle parcourue par `applyDatasets` côté tcomb
// (groupe : `node.fields` ; répétable : `node.item.fields`). Renvoie l'objet
// "options" de la feuille, ou `null` si un segment du chemin n'existe pas.
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

// Libellés du champ source, SI son design utilise une source dynamique
// (db/excel/admin_levels -> `options.fields[key].options = [{value,text}]`,
// cf. task_form_builder.js `_datasetToOptions`). Absent pour une liste
// statique "manuelle" (valeur === libellé, cas le plus courant) — dans ce
// cas `resolveChoicesFrom` retombe sur value-as-label, jamais d'erreur.
function labelsForField(designDoc: TaskLike, pageIndex: number, fieldPath: string): { [key: string]: string } | null {
  const page = designDoc?.form?.[pageIndex];
  const node = descendOptionsFields(page?.options?.fields, fieldPath);
  const list = node?.options;
  if (!Array.isArray(list)) return null;
  const map: { [key: string]: string } = {};
  list.forEach((o: any) => {
    if (o && o.value != null) map[String(o.value)] = o.text != null ? String(o.text) : String(o.value);
  });
  return map;
}

export function resolveChoicesFrom(
  entry: ChoicesFromEntry,
  ctx: {
    currentPageIndex: number;
    currentPageValue: any;
    task: TaskLike;
    externalDocs: { [taskId: number]: TaskLike | null | undefined };
  },
): ChoiceOption[] {
  const { pageIndex, rest } = parseSourcePath(entry.sourcePath);

  let designDoc: TaskLike | null | undefined;
  let effectivePageIndex: number;
  let rawValue: any;

  if (entry.sourceTaskId) {
    // Tâche différente : jamais de lecture live, toujours depuis un doc
    // CouchDB déjà pré-chargé (cf. externalDocs) — absent = pas encore
    // synchronisé/rempli -> aucune option (état "pas encore disponible",
    // pas une erreur).
    designDoc = ctx.externalDocs[entry.sourceTaskId];
    if (!designDoc || pageIndex == null) return [];
    effectivePageIndex = pageIndex;
    rawValue = resolvePath((designDoc.form_response || [])[pageIndex], rest);
  } else if (pageIndex != null) {
    // Même tâche, autre page : dernière valeur SAUVEGARDÉE de cette page
    // (task.form_response), pas la saisie live de la page en cours — même
    // sémantique que les conditions `rules` cross-page déjà en place.
    designDoc = ctx.task;
    effectivePageIndex = pageIndex;
    rawValue = resolvePath((ctx.task.form_response || [])[pageIndex], rest);
  } else {
    // Même page : valeur LIVE en cours de saisie -> effet "cascade en
    // direct" sans rien saisir de spécial côté mobile (recalculé par
    // `toggleFields`, appelé à chaque frappe).
    designDoc = ctx.task;
    effectivePageIndex = ctx.currentPageIndex;
    rawValue = resolvePath(ctx.currentPageValue, entry.sourcePath);
  }

  const rawValues: any[] = Array.isArray(rawValue) ? rawValue : (rawValue != null && rawValue !== '' ? [rawValue] : []);
  const values = rawValues.filter((v) => v != null && v !== '');
  if (!values.length) return [];

  const sourceFieldPath = pageIndex != null ? rest : entry.sourcePath;
  const labelMap = designDoc ? labelsForField(designDoc, effectivePageIndex, sourceFieldPath) : null;

  return values.map((v) => {
    const key = String(v);
    return { value: key, text: labelMap && labelMap[key] != null ? labelMap[key] : key };
  });
}

// Applique, pour toutes les entrées de `page.choicesFrom`, les options
// résolues sur l'arbre `options` déjà construit (mutation en place, même
// convention que `applyDatasets`/`_datasetToOptions` côté tcomb : dépose un
// tableau `[{value,text}]` sur `.options` (select_one) ET `.item.options`
// (select_multiple/checklist)) — AVANT de passer `options` au composant
// `<Form>`. `sourceTaskIds` (sortie) : liste des tâches externes à
// précharger pour que ces choix se résolvent (vide si aucune n'est
// référencée par cette page).
export function applyChoicesFromToOptions(
  choicesFrom: ChoicesFromEntry[] | undefined,
  fieldsOptions: any,
  ctx: {
    currentPageIndex: number;
    currentPageValue: any;
    task: TaskLike;
    externalDocs: { [taskId: number]: TaskLike | null | undefined };
  },
): void {
  if (!Array.isArray(choicesFrom) || !choicesFrom.length || !fieldsOptions) return;
  choicesFrom.forEach((entry) => {
    if (!entry || !entry.path) return;
    const target = descendOptionsFields(fieldsOptions, entry.path);
    if (!target) return;
    const resolved = resolveChoicesFrom(entry, ctx);
    target.options = resolved;
    target.item = target.item && typeof target.item === 'object' ? target.item : {};
    target.item.options = resolved;
  });
}

// Retourne le dict `properties` enfant d'un schéma object / array<object> —
// même logique que `_sub_properties` côté backend (`form_design.py`).
function subProperties(prop: any): any {
  if (!prop || typeof prop !== 'object') return null;
  if (prop.type === 'object') return prop.properties || {};
  if (prop.type === 'array') {
    const items = prop.items;
    if (items && typeof items === 'object' && items.type === 'object') return items.properties || {};
  }
  return null;
}

// Descend un chemin pointé (groupes compris) dans un arbre JSON-schema
// `properties` — même logique que `_resolve_local_prop` côté backend.
// Renvoie le schéma (`prop`) de la feuille, ou `null` si le chemin n'existe pas.
function resolveLocalProp(path: string, properties: any): any {
  const parts = String(path).split('.');
  let props = properties;
  let prop: any = null;
  for (let i = 0; i < parts.length; i++) {
    if (!props || typeof props !== 'object' || !(parts[i] in props)) return null;
    prop = props[parts[i]];
    props = subProperties(prop);
    if (props == null) props = {}; // feuille : ok si c'était le dernier segment
  }
  return prop;
}

// Le JSON-schema d'un champ CIBLE de `choicesFrom` porte encore l'`enum`
// STATIQUE saisi dans l'éditeur "Choix" du builder web (`compileSelectSchema`
// ne sait pas que ce champ a une source dynamique — `choicesFrom` est un
// mécanisme séparé, cf. en-tête de ce fichier) : le plus souvent vide ou
// incomplet, puisque les valeurs réelles ne sont connues qu'au remplissage.
// `t.enums` (tcomb) rejette alors TOUTE valeur choisie dynamiquement qui
// n'est pas dans cet enum figé -> `Form.getValue()` renvoie `null` et le
// champ s'affiche en rouge MÊME quand le facilitateur a bien répondu (bug
// signalé le 2026-09-17 : "après avoir fait le choix ... et cliqué sur
// SUIVANT, on met le champ en rouge alors que j'ai fait un choix").
//
// Fix : reconstruire l'`enum` de chaque champ CIBLE à partir des MÊMES
// options résolues par `resolveChoicesFrom` (donc toujours en phase avec ce
// qui est réellement sélectionnable dans le picker) juste avant de passer le
// schéma à `transform()` (tcomb-json-schema) — ne mute jamais `pageSchema`
// en place (clone uniquement les noeuds sur le chemin d'une cible touchée).
export function relaxChoicesFromSchema(
  pageSchema: any,
  choicesFrom: ChoicesFromEntry[] | undefined,
  ctx: {
    currentPageIndex: number;
    currentPageValue: any;
    task: TaskLike;
    externalDocs: { [taskId: number]: TaskLike | null | undefined };
  },
): any {
  if (!pageSchema || !Array.isArray(choicesFrom) || !choicesFrom.length) return pageSchema;
  let out: any = pageSchema;
  let cloned = false;
  choicesFrom.forEach((entry) => {
    if (!entry || !entry.path) return;
    const prop = resolveLocalProp(entry.path, (cloned ? out : pageSchema).properties || {});
    if (!prop) return;
    const enumTarget = prop.type === 'array' && prop.items && typeof prop.items === 'object' ? prop.items : prop;
    if (!('enum' in enumTarget)) return; // pas un champ select -> rien à faire (garde-fou)
    if (!cloned) {
      out = JSON.parse(JSON.stringify(pageSchema));
      cloned = true;
    }
    const livePropParent = resolveLocalProp(entry.path, out.properties || {});
    const liveEnumTarget = livePropParent.type === 'array' && livePropParent.items && typeof livePropParent.items === 'object'
      ? livePropParent.items
      : livePropParent;
    const resolved = resolveChoicesFrom(entry, ctx);
    const enumObj: { [key: string]: string } = {};
    resolved.forEach((o) => { enumObj[o.value] = o.text; });
    liveEnumTarget.enum = enumObj;
  });
  return out;
}

export function externalTaskIdsFor(choicesFrom: ChoicesFromEntry[] | undefined): number[] {
  if (!Array.isArray(choicesFrom)) return [];
  const ids = new Set<number>();
  choicesFrom.forEach((entry) => {
    if (entry && entry.sourceTaskId) ids.add(entry.sourceTaskId);
  });
  return Array.from(ids);
}
