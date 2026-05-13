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
var project;
var no_sql_db_name;
var COUCHDB_URL;


export async function nano_request(no_sql_db_name = null) {
    COUCHDB_LINK = EXPO_PUBLIC_COUCHDB_BASE_URL.replace('http://', '');

    username = JSON.parse(await getData('couchdbusername'));
    password = JSON.parse(await getData('couchdbpassword'));
    project = JSON.parse(await getData('project'));

    no_sql_db_name = no_sql_db_name ?? JSON.parse(await getData('no_sql_db_name'));


    COUCHDB_URL = `http://${username}:${password}@${COUCHDB_LINK}/${no_sql_db_name}`;

    NetInfo.fetch().then((state) => {
        if (!state.isConnected) {
            Alert.alert("Alert",
                "Vous n'êtes pas connecté à aucun réseau. Veuillez activer votre donnée mobile ou connecter vous à un wifi.",
                // [
                //      {text: 'Me connecter', onPress: () => Linking.openURL('package:com.android.settings')},
                //      {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                //      {text: 'OK', onPress: () => console.log('OK Pressed')},
                //    ]
            );
        }else if(!state.isInternetReachable){
            Alert.alert("Alert",
                "Nous n'arrivons pas a accéder à l'internet. Veuillez vérifier votre connexion!",
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
        let updatedDoc = { ...doc, ...updatedFields, _rev: docResponse.data._rev };

        if (project && !updatedDoc.project_name && ["phase", "activity", "task", "free_task"].includes(updatedDoc.type)) {
            updatedDoc = { ...updatedDoc, project_name: project.name }
        }

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
        let have_update_doc_conflit_message = JSON.parse(await getData('have_update_doc_conflit_message'));
        // if(!["false", false].includes(have_update_doc_conflit_message)){
        //     Alert.alert(
        //         "Alert", 
        //         "Une erreur s'est survenue lors de la mise à jour de vos données, veuillez vérifier la saisie et réessayer.\nCe message apparait uniquement lorsqu'il y a conflit des données.\nSouhaitez vous récevoir ce message de nouveau ?", 
        //         [
        //             {
        //               text: "Oui", onPress: async () => {
              
        //               }
        //             },
        //             {
        //               text: "Non", onPress: async () => {
        //                 await storeData('have_update_doc_conflit_message', JSON.stringify(false));
        //               }
        //             }
        //           ]
        //     );
        // }
        
    }
};

export const addDocument = async (newDoc, no_sql_db_name = null) => {
    try {
        await nano_request(no_sql_db_name);
        if (project && !newDoc.project_name && ["phase", "activity", "task", "free_task"].includes(newDoc.type)) {
            newDoc = { ...newDoc, project_name: project.name }
        }

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
        // if (project) {
        //     attributes = { project_name: project.name, ...attributes }
        // }
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

