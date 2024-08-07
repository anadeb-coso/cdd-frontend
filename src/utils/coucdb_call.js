import { EXPO_PUBLIC_COUCHDB_BASE_URL } from '../services/env'
// import PouchDB from 'pouchdb-react-native';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Buffer } from 'buffer';
import * as Linking from 'expo-linking';
// import LocalDatabase from './databaseManager';
import { getData } from './storageManager';
import { chunkArray } from './functions';
const axios = require('axios');
// Polyfill for btoa
global.btoa = (str) => {
    return Buffer.from(str, 'binary').toString('base64');
};

var COUCHDB_LINK;
var username;
var password;
var no_sql_db_name;
var COUCHDB_URL;


export async function nano_request(no_sql_db_name = null) {
    COUCHDB_LINK = EXPO_PUBLIC_COUCHDB_BASE_URL.replace('http://', '');

    username = JSON.parse(await getData('couchdbusername'));
    password = JSON.parse(await getData('couchdbpassword'));
    no_sql_db_name = no_sql_db_name ?? JSON.parse(await getData('no_sql_db_name'));


    COUCHDB_URL = `http://${username}:${password}@${COUCHDB_LINK}/${no_sql_db_name}`;

    NetInfo.fetch().then((state) => {
        if (!state.isConnected) {
            Alert.alert("Alert", 
                "Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!",
                // [
                //      {text: 'Me connecter', onPress: () => Linking.openURL('package:com.android.settings')},
                //      {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                //      {text: 'OK', onPress: () => console.log('OK Pressed')},
                //    ]
            );
        }
    });


}
export const getDocumentById = async (docId, no_sql_db_name = null) => {
    try {
        await nano_request(no_sql_db_name);

        const response = await axios.get(`${COUCHDB_URL}/${docId}`, 
            {
                auth: {
                    username: username,
                    password: password
                }
            });

        return response.data;
    } catch (error) {
        console.error('Error fetching document:', error);
    }
};

export const getAllDocuments = async (no_sql_db_name = null) => {
    try {
        await nano_request(no_sql_db_name);

        const response = await axios.get(`${COUCHDB_URL}/_all_docs?include_docs=true`, 
            {
                auth: {
                    username: username,
                    password: password
                }
            });
        // console.log(`{JSON.stringify(response.data.rows)}`)
        // console.log(`${JSON.stringify(response.data.rows)}`)
        return response.data.rows;
    } catch (error) {
        console.error('Error fetching documents:', error);
    }
};

export const updateDocument = async (docId, _updatedFields, no_sql_db_name = null) => {
    try {
        await nano_request(no_sql_db_name);

        const docResponse = await axios.get(`${COUCHDB_URL}/${docId}`, 
            {
                auth: {
                    username: username,
                    password: password
                }
            });
        const doc = docResponse.data;

        let updatedFields = {};
        try {
            updatedFields = _updatedFields(doc);
        } catch (e) {
            console.log(e);
            updatedFields = _updatedFields
        }
        // console.log("================updatedFields======================")
        // console.log(updatedFields)
        const updatedDoc = { ...doc, ...updatedFields, _rev: docResponse.data._rev };
        // console.log("================updatedDoc")
        // console.log(updatedDoc)
        const response = await axios.put(`${COUCHDB_URL}/${docId}`, updatedDoc, 
            {
                auth: {
                    username: username,
                    password: password
                }
            });
        // console.log(response)
        return response.data;
    } catch (error) {
        console.error('Error updating document:', error);
        Alert.alert("Alert", "Une erreur s'est survenue lors de la mise à jour de vos données, veuillez vérifier la saisie et réessayer.");
    }
};

export const addDocument = async (newDoc, no_sql_db_name = null) => {
    try {
        await nano_request(no_sql_db_name);

        const response = await axios.post(COUCHDB_URL, newDoc, 
            {
                auth: {
                    username: username,
                    password: password
                }
            });

        return response.data;
    } catch (error) {
        console.error('Error adding document:', error);
    }
};

export const getDocumentsByAttributes = async (attributes, limit = 250, skip = 0, no_sql_db_name = null) => {
    try {
        await nano_request(no_sql_db_name);

        const selector = {
            selector: attributes,
            limit: limit,
            skip: skip
        };
        
        const response = await axios.post(`${COUCHDB_URL}/_find`, selector, 
            {
                auth: {
                    username: username,
                    password: password
                }
            });

        const docs = response.data.docs;

        if (docs.length === limit) {
            const nextDocs = await getDocumentsByAttributes(attributes, limit, skip + limit);
            return { docs: docs.concat(nextDocs.docs) };
        }

        return { docs };

    } catch (error) {
        console.error('Error fetching documents:', error);
    }
};




// console.log(`http://${username}:${password}@${COUCHDB_LINK}`)
// const nano = require('nano')(`http://${username}:${password}@${COUCHDB_LINK}`);

// const db = nano.db.use(no_sql_db_name);

// const getDocumentById = async (docId) => {
//     try {
//         const doc = await db.get(docId);

//         return doc;
//     } catch (error) {
//         console.error('Error fetching document:', error);
//     }
// };

// const getAllDocuments = async () => {
//     try {
//         const result = await db.list({ include_docs: true });

//         return result.rows;
//     } catch (error) {
//         console.error('Error fetching documents:', error);
//     }
// };

// const updateDocument = async (docId, updatedFields) => {
//     try {
//         const doc = await db.get(docId);

//         const updatedDoc = { ...doc, ...updatedFields };

//         const response = await db.insert(updatedDoc);

//         return response;
//     } catch (error) {
//         console.error('Error updating document:', error);
//     }
// };

// const addDocument = async (newDoc) => {
//     try {
//         const response = await db.insert(newDoc);

//         return response;
//     } catch (error) {
//         console.error('Error adding document:', error);
//     }
// };

// const getDocumentsByAttributes = async (db, attributes) => {
//     try {
//         const selector = {
//             selector: attributes
//         };
//         const response = await db.find(selector);

//         return response.docs;
//     } catch (error) {
//         console.error('Error fetching documents:', error);
//     }
// };

const handleConflicts = async (dbConflit, dbFetch, conflicts) => {
    // Example conflict resolution logic
    // You may want to log conflicts, fetch the latest document, merge changes, and retry

    console.log('Resolving conflicts:', conflicts);

    const docsToDelete = conflicts.map(doc => ({
        ...doc,
        _deleted: true
    }));
    const deleteResult = await dbConflit.bulkDocs(docsToDelete);
    console.log('Documents deleted successfully in PouchDB:', deleteResult);

    const docsToSave = conflicts.map((_doc) => {
        const { _deleted, ...doc } = _doc;
        console.log(doc)
        return doc;
    });

    const saveResult = await dbFetch.bulkDocs(docsToSave);
    console.log('Documents saved successfully to CouchDB:', saveResult);


    // for (const conflict of conflicts) {
    //     const { _id } = conflict;
    //     try {
    //         // Fetch the latest document from the remote DB
    //         const doc = await dbFetch.get(_id);
    //         console.log('Fetched latest document:', doc);

    //         // Resolve conflict (example: overwrite local document)
    //         const deletedDoc = {
    //             ...doc,
    //             _deleted: true
    //         };
    //         await dbConflit.put(doc);
    //         await dbConflit.post(doc);
    //         console.log('Document updated db conflit:', doc);

    //         // Retry the update
    //         await dbFetch.put(doc);
    //         console.log('Document updated db fetch:', doc);

    //     } catch (error) {
    //         console.error('Failed to resolve conflict:', error);
    //     }
    // }
};

const bulkUpload = async (db, docs) => {
    let result = [];
    const chunks = chunkArray(docs, 5);
    console.log("chunks.length")
    console.log(chunks.length)
    for (const chunk of chunks) {
        result.concat(await db.bulkDocs(chunk));
        break;
    }
    return result;
};
/*
export const syncDocuments = async (
    db = LocalDatabase,
    attributes = { $or: [{ validated: { $in: [undefined, null, false] } }, { validated: { $exists: false } }] }
) => {
    try {
        await nano_request();

        // Initialize the local PouchDB database
        const localDB = db;
        console.log(COUCHDB_URL)
        // Initialize the remote CouchDB database URL
        const remoteDB = new PouchDB(COUCHDB_URL, {
            // fetch: (url, opts) => {
            //     opts.timeout = 10000; // 10 seconds timeout
            //     return PouchDB.fetch(url, opts);
            // }
        });

        // Fetch all documents from CouchDB
        // const remoteDocs = await remoteDB.allDocs({ include_docs: true });
        // const remoteDocsMap = new Map(remoteDocs.rows.map(row => [row.id, row.doc]));
        let limit = 50;
        let skip = 0;
        let remoteDocs = await getDocumentsByAttributes(attributes, limit, skip);
        while (remoteDocs.length === limit) {

            const localDocs = await localDB.find({ selector: attributes });

            const remoteDocsMap = new Map((remoteDocs ?? []).map(row => [row._id, row]));


            // Fetch all documents from local PouchDB
            // const localDocs = await localDB.allDocs({ include_docs: true });
            // const localDocsMap = new Map(localDocs.rows.map(row => [row.id, row.doc]));

            const localDocsMap = new Map((localDocs?.docs ?? []).map(row => [row._id, row]));

            // Compare and update local documents with remote documents
            const docsToUpdateLocally = [];
            remoteDocsMap.forEach((remoteDoc, id) => {
                const localDoc = localDocsMap.get(id);
                if (!localDoc || (localDoc._rev !== remoteDoc._rev)) {
                    docsToUpdateLocally.push(remoteDoc);
                }
                console.log("id " + id + " ")
            });
            console.log("docsToUpdateLocally.length")
            console.log(docsToUpdateLocally.length)

            // Save or update missing/outdated documents to local PouchDB
            if (docsToUpdateLocally.length > 0) {
                try {
                    const result = await bulkUpload(localDB, docsToUpdateLocally)

                    console.log('Local PouchDB updated:', result);
                    if (result && result.length != 0 && result[0].status == 409) {
                        console.log("await handleConflicts(localDB, remoteDB, conflicts)")
                        await handleConflicts(localDB, remoteDB, result);
                    }
                } catch (error) {
                    // Handle conflicts
                    if (error.name === 'conflict') {
                        console.log('Handling conflicts...');
                        // Resolve conflicts here or retry
                        await handleConflicts(localDB, remoteDB, docsToUpdateLocally);
                    } else {
                        throw error;
                    }
                }

            } else {
                console.log('Local PouchDB is up to date');
            }

            // // Compare and update remote documents with local documents
            // const docsToUpdateRemotely = [];
            // localDocsMap.forEach((localDoc, id) => {
            //     const remoteDoc = remoteDocsMap.get(id);
            //     if (!remoteDoc || localDoc._rev !== remoteDoc._rev) {
            //         docsToUpdateRemotely.push(localDoc);
            //     }
            // });

            // // Save or update missing/outdated documents to CouchDB
            // if (docsToUpdateRemotely.length > 0) {
            //     try {
            //         const result = await remoteDB.bulkDocs(docsToUpdateRemotely);
            //         console.log('Remote CouchDB updated:', result);
            //         if(result && result.length != 0 && result[0].status == 409){
            //             console.log("await handleConflicts(localDB, remoteDB, conflicts)")
            //             await handleConflicts(localDB, remoteDB, result);
            //         }
            //     } catch (error) {
            //         // Handle conflicts
            //         if (error.name === 'conflict') {
            //             console.log('Handling conflicts...');
            //             const conflicts = error.error;
            //             // Resolve conflicts here or retry
            //             await handleConflicts(localDB, remoteDB, conflicts);
            //         } else {
            //             throw error;
            //         }
            //     }
            // } else {
            //     console.log('Remote CouchDB is up to date');
            // }

            remoteDocs = await getDocumentsByAttributes(attributes, limit, skip + limit);
            break;
        }

    } catch (error) {
        console.error('Failed to sync documents:', error);
        // Alert.alert("Failed to sync documents", `Error: ${error.name}, Message: ${error.message}, Status: ${error.status}`);
    }
};


const syncDocumentsCouchdbToLocal = async (db = LocalDatabase, attributes = { validated: { $in: [undefined, null, false] } }) => {
    try {
        await nano_request();

        // Initialize the local PouchDB database
        const localDB = db;

        // Initialize the remote CouchDB database URL
        const remoteDB = new PouchDB(`http://${username}:${password}@${COUCHDB_LINK}`);

        // Fetch all documents from CouchDB
        // const remoteDocs = await remoteDB.allDocs({ include_docs: true });
        // const remoteDocsMap = new Map(remoteDocs.rows.map(row => [row.id, row.doc]));
        const remoteDocs = await getDocumentsByAttributes(attributes);
        const remoteDocsMap = new Map((remoteDocs ?? []).map(row => [row._id, row]));

        // Fetch all documents from local PouchDB
        // const localDocs = await localDB.allDocs({ include_docs: true });
        // const localDocsMap = new Map(localDocs.rows.map(row => [row.id, row.doc]));
        const localDocs = await localDB.find({ selector: attributes });
        const localDocsMap = new Map((localDocs?.docs ?? []).map(row => [row._id, row]));

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