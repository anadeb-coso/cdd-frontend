// import { AsyncStorage } from '@react-native-community/async-storage';
import { Alert, AsyncStorage } from 'react-native';
// import RNFS from 'react-native-fs';
import * as FileSystem from 'expo-file-system';

export const clearAsyncStorage = async () => {
    try {
        await AsyncStorage.clear();
        if (__DEV__) {
            console.log('AsyncStorage cleared successfully');
        }
    } catch (err) {
        if (__DEV__) {
            console.log('Failed to clear AsyncStorage', err);
        }
    }
};

// export const clearCache = async () => {
//     const cacheDir = RNFS.CachesDirectoryPath;
//     try {
//         await RNFS.unlink(cacheDir);
//         if (__DEV__) {
//             console.log('Cache cleared successfully');
//         }
//     } catch (err) {
//         if (__DEV__) {
//             console.log('Failed to clear cache', err);
//         }
//     }
// };
export const clearCache = async () => {
    const cacheDir = FileSystem.cacheDirectory;
    try {
        // Get all files in the cache directory
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        
        // Iterate over each file and delete it
        for (const file of files) {
            await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
        }
        
        if (__DEV__) {
            console.log('Cache cleared successfully');
        }
    } catch (err) {
        if (__DEV__) {
            console.log('Failed to clear cache', err);
        }
    }
};


export const handleStorageError = (error) => {
    if (error.code === 'SQLITE_FULL') {
        Alert.alert("Alert", "Stockage complet, veuillez libérer de l'espace.");
    } else {
        console.error('Erreur de stockage:', error);
    }
};


export const compactDatabase = async (db, msg=false) => {
    try {
        await db.compact();
        if(msg){
            Alert.alert("Opération éffectuée", 'La base de données a été compactée avec succès !');
        }
    } catch (e) {
        Alert.alert('Échec du compactage de la base de données.', e);
    }
};


export const clearLocalDatabase = async (db, _all=false, _completed=false, _validated=true) => {
    try {
        // Get all documents
        const allDocs = await db.allDocs({ include_docs: true });

        // Mark all documents for deletion
        const docsToDelete = allDocs.rows.map(row => ({
            ...row.doc,
            _deleted: (_all || (_completed && _completed == row.doc.completed) || (_validated && _validated == row.doc.validated)) ? true : false
        }));

        // Bulk delete documents
        const result = await db.bulkDocs(docsToDelete);
        console.log(result);
        Alert.alert('Base de données effacée', "result");
    } catch (error) {
        Alert.alert("Échec de l'effacement de la base de données:", error);
    }
};
