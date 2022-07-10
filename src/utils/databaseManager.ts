import React from 'react';
import PouchDB from 'pouchdb-react-native';
import PouchAuth from 'pouchdb-authentication';
import PouchAsyncStorage from 'pouchdb-adapter-asyncstorage';

PouchDB.plugin(PouchAuth);
PouchDB.plugin(require('pouchdb-upsert'));
PouchDB.plugin(require('pouchdb-find'));

PouchDB.plugin(PouchAsyncStorage);

const LocalDatabase = new PouchDB('cdd', {
  adapter: 'asyncstorage',
});

export const SyncToRemoteDatabase = async ({ username, password }) => {
  console.log(username, password);
  const remoteDB = new PouchDB(
    `http://db.couch.anadeb.e3grm.org:5984/${username}`,
    {
      skip_setup: true,
    },
  );

  try {
    await remoteDB.login(username, password);
    const syncDb = LocalDatabase.sync(remoteDB, {
      live: true,
      retry: true,
    });

    const syncStates = [
      'change',
      'paused',
      'active',
      'denied',
      'complete',
      'error',
    ];
    syncStates.forEach(state => {
      syncDb.on(state, currState =>
        console.log(`[Sync EADL: ${JSON.stringify(currState)}]`),
      );
    });
  } catch (e) {
    console.log('Error!:', e);
  }
};

export default LocalDatabase;
