const transform = require('tcomb-json-schema');
const t = require('tcomb-form-native');

// const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // format : YYYY-MM-DD
// const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/; // format ISO : YYYY-MM-DDTHH:mm[:ss]
// const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/; // format : HH:mm ou HH:mm:ss

transform.resetFormats();

transform.registerFormat("date", t.Date);
transform.registerFormat("datetime", t.Date);
transform.registerFormat("time", t.Date);

// Type custom "geopoint" : valeur = { latitude, longitude, accuracy, altitude,
// altitudeAccuracy, heading, speed, timestamp }. Le rendu est assuré par
// `GeoPointInput` (injecté comme `options.fields.<champ>.factory` par
// `applyGeoPointFactory`, côté écran). Ici on ne déclare QUE le type pour que
// `transform({type:'geopoint'})` ne lève pas et que "requis" / "facultatif"
// (t.Object vs t.maybe(t.Object)) fonctionnent.
if (typeof transform.registerType === "function") {
  try {
    transform.registerType("geopoint", t.Object);
  } catch (e) {
    // déjà enregistré (rechargement à chaud) : on ignore
  }
}

// Le form builder web peut produire des messages de validation personnalisés
// (`page.messages`). Ils sont transmis au module patché `tcomb-json-schema` via
// `transform.setMessages(...)` juste avant `transform(page.page)` côté écran ;
// `transform.resetMessages()` est appelé après. Repli silencieux si le module
// installé n'a pas encore été patché.
if (typeof transform.setMessages !== 'function') {
  transform.setMessages = function () {};
  transform.resetMessages = function () {};
}

module.exports = transform;
