import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import { migrations } from './migrations';
import CollectForm from './models/CollectForm';
import CollectSubmission from './models/CollectSubmission';

// Base SQLite dédiée (`cosocollect.db`), distincte des bases PouchDB/CouchDB des tâches.
// `jsi: false` : adaptateur asynchrone autolinké (aucune configuration native supplémentaire).
const adapter = new SQLiteAdapter({
  dbName: 'cosocollect',
  schema,
  migrations,
  jsi: false,
  onSetUpError: (error) => {
    // eslint-disable-next-line no-console
    console.error('COSOCollect : erreur d’ouverture de la base locale', error);
  },
});

export const collectDatabase = new Database({
  adapter,
  modelClasses: [CollectForm, CollectSubmission],
});

export { CollectForm, CollectSubmission };
