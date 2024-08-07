import React, { useContext } from 'react';
import { EventEmitter } from 'events';
// import PouchDB from 'pouchdb-react-native';
// import PouchAuth from 'pouchdb-authentication';
// import PouchAsyncStorage from 'pouchdb-adapter-asyncstorage';
import { storeData, getData } from './storageManager';
import { EXPO_PUBLIC_COUCHDB_BASE_URL } from '../services/env'
import { handleStorageError } from './pouchdb_call';

//https://chatgpt.com/share/72f90e9a-ebe2-4ab6-98df-5505b2c79e47

// PouchDB.plugin(PouchAuth);
// PouchDB.plugin(require('pouchdb-upsert'));
// PouchDB.plugin(require('pouchdb-find'));

// PouchDB.plugin(PouchAsyncStorage);

export const couchDBURLBase = EXPO_PUBLIC_COUCHDB_BASE_URL;
const syncStates = [
  'change',
  'paused',
  'active',
  'denied',
  'complete',
  'error',
];
const events = require('events');
events.EventEmitter.defaultMaxListeners = 50;

/*

// const LocalDatabase = new PouchDB('cdd', {
//   adapter: 'asyncstorage',
// });
let LocalDatabase = new PouchDB('cdd', {
  adapter: 'asyncstorage',
  size: 700, // Size in MB
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

export const LocalDatabaseProcessDesign = new PouchDB('process_design', {
  adapter: 'asyncstorage',
});
LocalDatabaseProcessDesign.createIndex({
  index: {
    fields: ['phase_id', 'phase_name', 'type', 'activity_id', 'activity_name', 'name', 'sql_id', 'task_order']
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
  await storeData('couchdbusername', JSON.stringify(username));
  await storeData('couchdbpassword', JSON.stringify(password));


  if (LocalDatabase._destroyed) {
    LocalDatabase = new PouchDB('cdd', {
      adapter: 'asyncstorage',
      size: 700, // Size in MB
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
      filter: (doc: any) => {
        return doc.validated !== true;
      }
    });

    syncStates.forEach(state => {
      syncDb.on(state, currState => {
        if (__DEV__) {
          console.log(`[Sync "${state}": ${JSON.stringify(currState)}]`);
        }
        compactDatabase(LocalDatabase);
      });
    });




    // try {
    let email = JSON.parse(await getData('email'));
    if (username && password) {
      // GRM ADLS DOC
      if (email) {
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
            compactDatabase(LocalDatabaseADL);
          });
        });
      }
      // End GRM ADLS DOC


      // Process Design
      const remoteProcessDesign = new PouchDB(`${couchDBURLBase}/process_design`, {
        skip_setup: true,
      });
      await remoteProcessDesign.login(username, password);
      const syncProcessDesign = LocalDatabaseProcessDesign.sync(remoteProcessDesign, {
        live: true,
        retry: true,
      });
      syncStates.forEach((state) => {
        syncProcessDesign.on(state, (currState: any) => {
          if (__DEV__) {
            console.log(`[Sync Process Design: ]`);
          }
          compactDatabase(LocalDatabaseProcessDesign);
        });
      });
      //End Process Design
    }
    // } catch (e: any) { }

    return true;
  } catch (e: any) {
    console.log('Error!:', e);
    // const { signOut } = useContext(AuthContext);
    // signOut();
    handleStorageError(e);
    if (!(['ETIMEDOUT', 'unknown'].includes(e.name) || ['ETIMEDOUT', undefined].includes(e.message))) {
      if (JSON.parse(await getData('no_sql_user'))) {
        // LocalDatabase.destroy()
        //   .then(function (response: any) {

        //   })
        //   .catch(function (err: any) {
        //     console.log(err);
        //   });
      }

    }




    return false;
  }
};
*/

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
  await storeData('couchdbusername', JSON.stringify(username));
  await storeData('couchdbpassword', JSON.stringify(password));

}


// export default LocalDatabase;
