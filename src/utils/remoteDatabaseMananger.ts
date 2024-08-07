//https://chatgpt.com/share/72f90e9a-ebe2-4ab6-98df-5505b2c79e47

import React, { useContext } from 'react';
import PouchDB from 'pouchdb-react-native';
import PouchAuth from 'pouchdb-authentication';
import PouchAsyncStorage from 'pouchdb-adapter-asyncstorage';
import PouchFind from 'pouchdb-find';
import { storeData, getData } from './storageManager';
import { EXPO_PUBLIC_COUCHDB_BASE_URL } from '../services/env'
import { handleStorageError } from './pouchdb_call';

PouchDB.plugin(PouchAuth);
PouchDB.plugin(PouchFind);
PouchDB.plugin(require('pouchdb-upsert'));

PouchDB.plugin(PouchAsyncStorage);

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


export const LocalDatabaseProcessDesign = async () => {
    let username = JSON.parse(await getData('couchdbusername'));
    let password = JSON.parse(await getData('couchdbpassword'));

    let _LocalDatabaseProcessDesign = new PouchDB(`${couchDBURLBase}/process_design`, {
        skip_setup: true,
    });
    await _LocalDatabaseProcessDesign.login(username, password);

    return _LocalDatabaseProcessDesign;
}

export const LocalDatabaseADL = async () => {
    let username = JSON.parse(await getData('couchdbusername'));
    let password = JSON.parse(await getData('couchdbpassword'));

    let _LocalDatabaseADL = new PouchDB(`${couchDBURLBase}/eadls`, {
        skip_setup: true,
    });
    await _LocalDatabaseADL.createIndex({
        index: {
            fields: ['representative.email', 'representative.id', 'type']
        }
    }).then(function () {
        // Index created successfully
    }).catch(function (err) {
        // Handle error
        console.log(err);
    });
    await _LocalDatabaseADL.login(username, password);

    return _LocalDatabaseADL;
}

const LocalDatabase = async () => {
    let no_sql_user = JSON.parse(await getData('no_sql_user'));
    let no_sql_pass = JSON.parse(await getData('no_sql_pass'));
    let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));
    let username = JSON.parse(await getData('couchdbusername'));
    let password = JSON.parse(await getData('couchdbpassword'));

    let _LocalDatabase = new PouchDB(`${couchDBURLBase}/${no_sql_db_name}`, {
        skip_setup: true
    });
    await _LocalDatabase.login(username, password);
    
    return _LocalDatabase;
}

export default LocalDatabase;