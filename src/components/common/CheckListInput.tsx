/**
 * Champ « Choix multiple (cases à cocher) » pour les formulaires de tâche
 * (type de champ `select_multiple_check` produit par le form builder web).
 *
 * - Schéma : { type:'array', items:{ type:'string', enum:{...} } } -> tcomb
 *   `t.list(t.enums(...))` (ou `t.maybe(...)`), valeur = tableau de valeurs.
 * - `options.mode === 'checklist'` -> ce composant est injecté comme
 *   `options.fields.<champ>.factory` par `applyCheckListFactory()`, appelé par
 *   les écrans TaskDetail(/Test) après `applyStyleRecursively` /
 *   `buildDynamicOptions` (mêmes points que `applyGeoPointFactory`).
 * - Les choix viennent de `options.options` = [{ value, text }] :
 *     - source « liste manuelle » : figée par le builder ;
 *     - source dynamique (PostgreSQL / Excel / niveaux) : recalculée à chaque
 *       rendu par `cdd-form-logic.applyDatasets` (cascade comprise).
 *   Repli : dérivé de l'`enum` du type tcomb.
 *
 * Perf : au-delà de `options.listThreshold` choix (réglé par champ dans le form
 * builder ; défaut 25), on passe en `FlatList` virtualisée (seules les lignes
 * visibles sont montées) + champ de recherche + hauteur bornée, et le contenu
 * est monté APRÈS l'animation de navigation (`InteractionManager`) pour que
 * l'écran s'ouvre immédiatement.
 */
import React from 'react';
import { FlatList, InteractionManager, TouchableOpacity } from 'react-native';
import { Box, HStack, Input, Spinner, Text, VStack } from 'native-base';

const tcomb: any = require('tcomb-form-native');

const DEFAULT_INLINE_MAX = 25; // défaut ; réglable par champ via options.listThreshold
const ROW_HEIGHT = 40;
const LIST_MAX_HEIGHT = 320;

type Choice = { value: string; text: string };

function choicesFromType(type: any): Choice[] {
  let inner = type;
  const seen = new Set();
  while (inner && inner.meta && !seen.has(inner)) {
    seen.add(inner);
    const kind = inner.meta.kind;
    if (kind === 'maybe' || kind === 'subtype' || kind === 'list') {
      inner = inner.meta.type;
      continue;
    }
    if (kind === 'enums') {
      const map = inner.meta.map || {};
      return Object.keys(map).map((v) => ({ value: v, text: String(map[v]) }));
    }
    break;
  }
  return [];
}

function normalize(s: string) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function CheckRow(props: {
  choice: Choice;
  checked: boolean;
  disabled?: boolean;
  onToggle: (v: string) => void;
}) {
  const { choice, checked } = props;
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      disabled={props.disabled}
      onPress={() => props.onToggle(choice.value)}
      style={{ height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center' }}
    >
      <Box
        w={5}
        h={5}
        mr={2}
        borderWidth={1.5}
        borderColor={checked ? '#24c38b' : '#bbbbbb'}
        borderRadius={4}
        bg={checked ? '#24c38b' : 'white'}
        alignItems="center"
        justifyContent="center"
      >
        {checked && (
          <Text color="white" fontSize={12} fontWeight="900">
            {'✓'}
          </Text>
        )}
      </Box>
      <Text fontSize="sm" flexShrink={1} numberOfLines={2}>
        {choice.text}
      </Text>
    </TouchableOpacity>
  );
}

function CheckListWidget(props: {
  value: string[];
  choices: Choice[];
  inlineMax?: number;
  hidden?: boolean;
  disabled?: boolean;
  label?: string;
  help?: string;
  hasError?: boolean;
  error?: any;
  onChange: (v: string[]) => void;
}) {
  const value = React.useMemo(
    () => (Array.isArray(props.value) ? props.value.map(String) : []),
    [props.value],
  );
  const selected = React.useMemo(() => new Set(value), [value]);
  const choices = props.choices || [];
  const inlineMax =
    Number(props.inlineMax) > 0 ? Number(props.inlineMax) : DEFAULT_INLINE_MAX;
  const big = choices.length > inlineMax;

  // Écran ouvert tout de suite ; grosse liste montée après l'animation.
  const [ready, setReady] = React.useState(!big);
  React.useEffect(() => {
    if (ready) return;
    const handle = InteractionManager.runAfterInteractions(() => setReady(true));
    return () => handle && handle.cancel && handle.cancel();
  }, [ready]);

  const [search, setSearch] = React.useState('');
  const showSearch = choices.length > 1;
  const filtered = React.useMemo(() => {
    if (!search.trim()) return choices;
    const q = normalize(search);
    return choices.filter((c) => normalize(c.text).indexOf(q) !== -1);
  }, [choices, search]);

  const toggle = React.useCallback(
    (v: string) => {
      if (props.disabled) return;
      const next = selected.has(v)
        ? value.filter((x) => x !== v)
        : value.concat(v);
      props.onChange(next);
    },
    [props, selected, value],
  );

  if (props.hidden) return null;

  const Frame = (children: React.ReactNode) => (
    <Box mb={4}>
      {!!props.label && (
        <Text fontSize="sm" color="#707070" fontWeight="600" mb={1}>
          {props.label}
        </Text>
      )}
      {!!props.help && (
        <Text fontSize="xs" color="gray.500" mb={1}>
          {props.help}
        </Text>
      )}
      <Box
        borderWidth={1}
        borderColor={props.hasError ? '#e53e3e' : '#dddddd'}
        borderRadius={10}
        p={3}
        bg="white"
      >
        {children}
      </Box>
      {props.hasError && !!props.error && (
        <Text fontSize="xs" color="#e53e3e" mt={1}>
          {props.error}
        </Text>
      )}
    </Box>
  );

  if (choices.length === 0) {
    return Frame(
      <Text fontSize="sm" color="gray.400">
        {'—'}
      </Text>,
    );
  }

  if (!ready) {
    return Frame(
      <HStack space={2} alignItems="center">
        <Spinner size="sm" />
        <Text fontSize="xs" color="gray.500">
          {`${choices.length} …`}
        </Text>
      </HStack>,
    );
  }

  // Barre de recherche présente sur TOUS les champs (dès 2 choix) + compteur.
  const header = (
    <>
      {showSearch && (
        <Input
          size="sm"
          placeholder={`Rechercher… (${choices.length})`}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      )}
      {value.length > 0 && (
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="xs" color="gray.500">
            {`${value.length} sélectionné(s)`}
          </Text>
          <TouchableOpacity
            onPress={() => props.onChange([])}
            disabled={props.disabled}
          >
            <Text fontSize="xs" color="#e53e3e">
              {'Tout décocher'}
            </Text>
          </TouchableOpacity>
        </HStack>
      )}
    </>
  );

  const rowFor = (c: Choice) => (
    <CheckRow
      key={String(c.value)}
      choice={c}
      checked={selected.has(String(c.value))}
      disabled={props.disabled}
      onToggle={toggle}
    />
  );

  // Petite liste : rendu inline (VStack). Grande liste : FlatList virtualisée.
  return Frame(
    <VStack space={2}>
      {header}
      {!big ? (
        filtered.length === 0 ? (
          <Text fontSize="xs" color="gray.400" py={2}>
            {'Aucun résultat'}
          </Text>
        ) : (
          <VStack space={1}>{filtered.map(rowFor)}</VStack>
        )
      ) : (
        <Box style={{ maxHeight: LIST_MAX_HEIGHT }}>
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.value)}
            extraData={value}
            initialNumToRender={12}
            maxToRenderPerBatch={16}
            windowSize={7}
            removeClippedSubviews
            keyboardShouldPersistTaps="handled"
            getItemLayout={(_, index) => ({
              length: ROW_HEIGHT,
              offset: ROW_HEIGHT * index,
              index,
            })}
            renderItem={({ item }) => rowFor(item)}
            ListEmptyComponent={
              <Text fontSize="xs" color="gray.400" py={2}>
                {'Aucun résultat'}
              </Text>
            }
          />
        </Box>
      )}
    </VStack>,
  );
}

/**
 * Sous-classe tcomb-form-native : le stockage / la validation restent gérés par
 * le `Component` de base (valeur = tableau) ; seul le rendu est remplacé.
 */
class CheckListInput extends tcomb.form.Component {
  getTemplate() {
    const self: any = this;
    return function render(locals: any) {
      const opts = self.props.options || {};
      const choices =
        Array.isArray(opts.options) && opts.options.length
          ? opts.options
          : choicesFromType(self.props.type);
      return (
        <CheckListWidget
          value={locals.value}
          choices={choices}
          inlineMax={Number(opts.listThreshold) || undefined}
          hidden={locals.hidden}
          disabled={opts.editable === false || opts.disabled === true}
          label={locals.label}
          help={opts.help}
          hasError={locals.hasError}
          error={locals.error}
          onChange={locals.onChange}
        />
      );
    };
  }
}

// La valeur d'un select_multiple_check est toujours un tableau (une chaîne
// héritée d'un ancien select_one -> [chaîne] ; nil / "" -> []).
(CheckListInput as any).transformer = {
  format: (value: any) =>
    Array.isArray(value)
      ? value
      : value === null || value === undefined || value === ''
      ? []
      : [value],
  parse: (value: any) => (Array.isArray(value) ? value : []),
};

export default CheckListInput;

/**
 * Parcourt `options.fields` (+ `.fields` des groupes, `.item.fields` des
 * répétables) et injecte `factory = CheckListInput` sur chaque champ marqué
 * `mode === 'checklist'`. Idempotent. Mute `options` en place et le retourne.
 */
export function applyCheckListFactory(options: any): any {
  if (!options || typeof options !== 'object') return options;

  const walk = (fields: any) => {
    if (!fields || typeof fields !== 'object') return;
    Object.keys(fields).forEach((key) => {
      const f = fields[key];
      if (!f || typeof f !== 'object') return;
      if (f.mode === 'checklist') f.factory = CheckListInput;
      if (f.fields) walk(f.fields);
      if (f.item && f.item.fields) walk(f.item.fields);
    });
  };

  walk(options.fields);
  if (options.item && options.item.fields) walk(options.item.fields);
  return options;
}
