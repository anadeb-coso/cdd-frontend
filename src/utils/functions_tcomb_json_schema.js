const transform = require('tcomb-json-schema');
const t = require('tcomb-form-native');

// const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // format : YYYY-MM-DD
// const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/; // format ISO : YYYY-MM-DDTHH:mm[:ss]
// const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/; // format : HH:mm ou HH:mm:ss

transform.resetFormats();

transform.registerFormat("date", t.Date);
transform.registerFormat("datetime", t.Date);
// transform.registerFormat("time", t.Date);


module.exports = transform;