import React, { useContext } from 'react';
import PouchDB from 'pouchdb-react-native';
import PouchAuth from 'pouchdb-authentication';
import PouchAsyncStorage from 'pouchdb-adapter-asyncstorage';
import { storeData, getData } from './storageManager';

PouchDB.plugin(PouchAuth);
PouchDB.plugin(require('pouchdb-upsert'));
PouchDB.plugin(require('pouchdb-find'));

PouchDB.plugin(PouchAsyncStorage);

export const couchDBURLBase = "http://54.183.195.20:5984";
const syncStates = [
  'change',
  'paused',
  'active',
  'denied',
  'complete',
  'error',
];

// const LocalDatabase = new PouchDB('cdd', {
//   adapter: 'asyncstorage',
// });
let LocalDatabase = new PouchDB('cdd', {
  adapter: 'asyncstorage',
});

export const LocalDatabaseADL = new PouchDB('eadl', {
  adapter: 'asyncstorage',
});
LocalDatabaseADL.createIndex({
  index: {
    fields: ['representative.email', 'representative.id', 'type']
  }
}).then(function () {
  // Index created successfully
}).catch(function (err: any) {
  // Handle error
  console.log(err);
});

export const SyncToRemoteDatabase = async ({
  no_sql_user,
  no_sql_pass,
  no_sql_db_name,
  username,
  password,
}) => {

  await storeData('no_sql_user', JSON.stringify(no_sql_user));
  await storeData('no_sql_pass', JSON.stringify(no_sql_pass));
  await storeData('no_sql_db_name', JSON.stringify(no_sql_db_name));


  if (LocalDatabase._destroyed) {
    LocalDatabase = new PouchDB('cdd', {
      adapter: 'asyncstorage',
    });
  }
  // console.log(username, password);

  const remoteDB = new PouchDB(`${couchDBURLBase}/${no_sql_db_name}`, {
    // no_sql_user = 'root';
    // no_sql_pass = 'root';
    // const remoteDB = new PouchDB(`http://10.0.2.2:5984/${no_sql_db_name}`, {
    skip_setup: true,
  });
  try {
    await remoteDB.login(no_sql_user, no_sql_pass);
    const syncDb = LocalDatabase.sync(remoteDB, {
      live: true,
      retry: true,
    });

    syncStates.forEach(state => {
      syncDb.on(state, currState => {
        if (__DEV__) {
          console.log(`[Sync EADL: ${JSON.stringify(currState)}]`);
        }
      });
    });



    //GRM ADLS DOC
    // try {
      let email = JSON.parse(await getData('email'));
      if (username && password && email) {
        const remoteADL = new PouchDB(`${couchDBURLBase}/eadls`, {
          skip_setup: true,
        });
        await remoteADL.login(username, password);
        const syncADL = LocalDatabaseADL.sync(remoteADL, {
          live: true,
          retry: true,
          filter: 'eadl/by_user_email',
          query_params: { email: email },
        });
        syncStates.forEach((state) => {
          syncADL.on(state, (currState: any) => {
            if (__DEV__) {
              console.log(`[Sync EAD_L: ]`);
            }
          });
        });
      }
    // } catch (e: any) { }

    return true;
  } catch (e: any) {
    console.log('Error!:', e);
    // const { signOut } = useContext(AuthContext);
    // signOut();

    if (!(['ETIMEDOUT', 'unknown'].includes(e.name) || ['ETIMEDOUT', undefined].includes(e.message))) {
      if (JSON.parse(await getData('no_sql_user'))) {
        LocalDatabase.destroy()
          .then(function (response: any) {

          })
          .catch(function (err: any) {
            console.log(err);
          });
      }

    }




    return false;
  }
};

export default LocalDatabase;
