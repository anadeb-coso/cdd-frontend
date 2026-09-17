/**
 * Titre des groupes (champs de type `group`/`repeat` du form builder) en
 * GRAS sur mobile.
 *
 * Surcharge les templates stock de tcomb-form-native (`struct.js` pour un
 * groupe simple, `list.js` pour un groupe répétable) via `options.template`
 * — point d'extension STANDARD de tcomb-form-native (`getTemplate() {
 * return this.props.options.template || this.getTemplates().struct/list; }`,
 * `node_modules/tcomb-form-native/lib/components.js`), donc AUCUN patch du
 * fork nécessaire. Les 2 fonctions ci-dessous sont des copies conformes des
 * templates stock (`lib/templates/bootstrap/struct.js`/`list.js`), avec
 * uniquement `fontWeight: 'bold'` ajouté au style du libellé.
 *
 * Injecté par `applyGroupTitleFactory()`, même convention que
 * `applyGeoPointFactory`/`applyCheckListFactory` (walk récursif de
 * `options.fields`, appelé par les écrans TaskDetail(/Test) juste après ces
 * 2 autres factories).
 */
import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';

function boldLabel(locals: any, stylesheet: any) {
  const base = locals.hasError ? stylesheet.controlLabel.error : stylesheet.controlLabel.normal;
  return locals.label ? (
    <Text style={[base, { fontWeight: 'bold' }]}>{locals.label}</Text>
  ) : null;
}

// Groupe simple (`type: "group"`) — copie de struct.js avec titre en gras.
function boldGroupStructTemplate(locals: any) {
  if (locals.hidden) return null;

  const stylesheet = locals.stylesheet;
  const label = boldLabel(locals, stylesheet);
  const error = locals.hasError && locals.error ? (
    <Text accessibilityLiveRegion="polite" style={stylesheet.errorBlock}>{locals.error}</Text>
  ) : null;
  const rows = locals.order.map((name: string) => locals.inputs[name]);

  return (
    <View style={stylesheet.fieldset}>
      {label}
      {error}
      {rows}
    </View>
  );
}

// Groupe répétable (`type: "repeat"`) — copie de list.js avec titre en gras.
function renderRowWithoutButtons(item: any) {
  return <View key={item.key}>{item.input}</View>;
}
function renderRowButton(button: any, stylesheet: any, style?: any) {
  return (
    <TouchableHighlight key={button.type} style={[stylesheet.button, style]} onPress={button.click}>
      <Text style={stylesheet.buttonText}>{button.label}</Text>
    </TouchableHighlight>
  );
}
function renderButtonGroup(buttons: any[], stylesheet: any) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {buttons.map((button) => renderRowButton(button, stylesheet, { width: 50 }))}
    </View>
  );
}
function renderRow(item: any, stylesheet: any) {
  return (
    <View key={item.key} style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1 }}>{item.input}</View>
      <View style={{ flex: 1 }}>{renderButtonGroup(item.buttons, stylesheet)}</View>
    </View>
  );
}
function boldGroupListTemplate(locals: any) {
  if (locals.hidden) return null;

  const stylesheet = locals.stylesheet;
  const label = boldLabel(locals, stylesheet);
  const error = locals.hasError && locals.error ? (
    <Text accessibilityLiveRegion="polite" style={stylesheet.errorBlock}>{locals.error}</Text>
  ) : null;
  const rows = locals.items.map((item: any) => (
    item.buttons.length === 0 ? renderRowWithoutButtons(item) : renderRow(item, stylesheet)
  ));
  const addButton = locals.add ? renderRowButton(locals.add, stylesheet) : null;

  return (
    <View style={stylesheet.fieldset}>
      {label}
      {error}
      {rows}
      {addButton}
    </View>
  );
}

export function applyGroupTitleFactory(options: any): any {
  if (!options || typeof options !== 'object') return options;

  const walk = (fields: any) => {
    if (!fields || typeof fields !== 'object') return;
    Object.keys(fields).forEach((key) => {
      const f = fields[key];
      if (!f || typeof f !== 'object') return;
      if (f.fields) {
        f.template = boldGroupStructTemplate;
        walk(f.fields);
      }
      if (f.item && f.item.fields) {
        f.template = boldGroupListTemplate;
        walk(f.item.fields);
      }
    });
  };

  walk(options.fields);
  if (options.item && options.item.fields) walk(options.item.fields);
  return options;
}
