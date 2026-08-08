import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
// import RNFS from 'react-native-fs';
import * as FileSystem from 'expo-file-system';
import i18n from '../translations/i18n';

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
        Alert.alert(i18n.t('alert', { ns: 'common' }), i18n.t('storage_full', { ns: 'utils' }));
    } else {
        console.error('Erreur de stockage:', error);
    }
};


export const compactDatabase = async (db, msg=false) => {
    try {
        await db.compact();
        if(msg){
            Alert.alert(i18n.t('operation_completed_title', { ns: 'utils' }), i18n.t('database_compacted_success', { ns: 'utils' }));
        }
    } catch (e) {
        Alert.alert(i18n.t('database_compaction_failed_title', { ns: 'utils' }), e);
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
        Alert.alert(i18n.t('database_cleared_title', { ns: 'utils' }), i18n.t('database_cleared_success', { ns: 'utils' }));
    } catch (error) {
        Alert.alert(i18n.t('database_clear_failed_title', { ns: 'utils' }), error);
    }
};
