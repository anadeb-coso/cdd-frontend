/*import { EXPO_PUBLIC_COUCHDB_BASE_URL } from '../services/env'
import PouchDB from 'pouchdb-react-native';
import LocalDatabase from './databaseManager';
const axios = require('axios');


const COUCHDB_LINK = EXPO_PUBLIC_COUCHDB_BASE_URL.replace('http://', '');
console.log(COUCHDB_LINK)

let username = JSON.parse(await getData('couchdbusername'));
let password = JSON.parse(await getData('couchdbpassword'));
let no_sql_db_name = JSON.parse(await getData('no_sql_db_name'));
console.log(`http://${username}:${password}@${COUCHDB_LINK}`)


const COUCHDB_URL = `http://${username}:${password}@${COUCHDB_LINK}/${no_sql_db_name}`;

export const getDocumentById = async (docId) => {
    try {
        const response = await axios.get(`${COUCHDB_URL}/${docId}`);
        
        return response.data;
    } catch (error) {
        console.error('Error fetching document:', error);
    }
};

export const getAllDocuments = async () => {
    try {
        const response = await axios.get(`${COUCHDB_URL}/_all_docs?include_docs=true`);
        
        return response.data.rows;
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
};

export const updateDocument = async (docId, updatedFields) => {
    try {
        const docResponse = await axios.get(`${COUCHDB_URL}/${docId}`);
        const doc = docResponse.data;

        const updatedDoc = { ...doc, ...updatedFields };

        const response = await axios.put(`${COUCHDB_URL}/${docId}`, updatedDoc);

        return response.data;
    } catch (error) {
        console.error('Error updating document:', error);
    }
};

export const addDocument = async (newDoc) => {
    try {
        const response = await axios.post(COUCHDB_URL, newDoc);
        
        return response.data;
    } catch (error) {
        console.error('Error adding document:', error);
    }
};

export const getDocumentsByAttributes = async (attributes) => {
    try {
        const selector = {
            selector: attributes
        };
        const response = await axios.post(`${COUCHDB_URL}/_find`, selector);
        
        return response.data.docs;
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
};


export const syncDocuments = async (db=LocalDatabase, attributes={validated: {$in: [undefined, null, false]}}) => {
    try {
        // Initialize the local PouchDB database
        const localDB = db;
console.log(`http://${username}:${password}@${COUCHDB_LINK}`)
        // Initialize the remote CouchDB database URL
        const remoteDB = new PouchDB(`http://${username}:${password}@${COUCHDB_LINK}`);

        // Fetch all documents from CouchDB
        // const remoteDocs = await remoteDB.allDocs({ include_docs: true });
        // const remoteDocsMap = new Map(remoteDocs.rows.map(row => [row.id, row.doc]));
        const remoteDocs = await getDocumentsByAttributes(remoteDB, attributes);
        const remoteDocsMap = new Map(remoteDocs.map(row => [row._id, row]));
        

        // Fetch all documents from local PouchDB
        // const localDocs = await localDB.allDocs({ include_docs: true });
        // const localDocsMap = new Map(localDocs.rows.map(row => [row.id, row.doc]));
        const localDocs = await getDocumentsByAttributes(localDB, attributes);
        const localDocsMap = new Map(localDocs.map(row => [row._id, row]));

        // Compare and update local documents with remote documents
        const docsToUpdateLocally = [];
        remoteDocsMap.forEach((remoteDoc, id) => {
            const localDoc = localDocsMap.get(id);
            if (!localDoc || localDoc._rev !== remoteDoc._rev) {
                docsToUpdateLocally.push(remoteDoc);
            }
        });

        // Save or update missing/outdated documents to local PouchDB
        if (docsToUpdateLocally.length > 0) {
            const result = await localDB.bulkDocs(docsToUpdateLocally);
            console.log('Local PouchDB updated:', result);
        } else {
            console.log('Local PouchDB is up to date');
        }

        // Compare and update remote documents with local documents
        const docsToUpdateRemotely = [];
        localDocsMap.forEach((localDoc, id) => {
            const remoteDoc = remoteDocsMap.get(id);
            if (!remoteDoc || localDoc._rev !== remoteDoc._rev) {
                docsToUpdateRemotely.push(localDoc);
            }
        });

        // Save or update missing/outdated documents to CouchDB
        if (docsToUpdateRemotely.length > 0) {
            const result = await remoteDB.bulkDocs(docsToUpdateRemotely);
            console.log('Remote CouchDB updated:', result);
        } else {
            console.log('Remote CouchDB is up to date');
        }

    } catch (error) {
        console.error('Failed to sync documents:', error);
    }
};


const syncDocumentsCouchdbToLocal = async (db=LocalDatabase, attributes={validated: {$in: [undefined, null, false]}}) => {
    try {
        // Initialize the local PouchDB database
        const localDB = db;

        // Initialize the remote CouchDB database URL
        const remoteDB = new PouchDB(`http://${username}:${password}@${COUCHDB_LINK}`);

        // Fetch all documents from CouchDB
        // const remoteDocs = await remoteDB.allDocs({ include_docs: true });
        // const remoteDocsMap = new Map(remoteDocs.rows.map(row => [row.id, row.doc]));
        const remoteDocs = await getDocumentsByAttributes(remoteDB, attributes);
        const remoteDocsMap = new Map(remoteDocs.map(row => [row._id, row]));

        // Fetch all documents from local PouchDB
        // const localDocs = await localDB.allDocs({ include_docs: true });
        // const localDocsMap = new Map(localDocs.rows.map(row => [row.id, row.doc]));
        const localDocs = await getDocumentsByAttributes(localDB, attributes);
        const localDocsMap = new Map(localDocs.map(row => [row._id, row]));

        // Find documents that are in CouchDB but not in local PouchDB
        const docsToSave = [];
        for (let [id, remoteDoc] of remoteDocsMap) {
            if (!localDocsMap.has(id)) {
                docsToSave.push(remoteDoc);
            }
        }

        // Save missing documents to local PouchDB
        if (docsToSave.length > 0) {
            const result = await localDB.bulkDocs(docsToSave);
            console.log('Missing documents saved to local PouchDB:', result);
        } else {
            console.log('No missing documents to save');
        }
    } catch (error) {
        console.error('Failed to sync documents:', error);
    }
};
*/