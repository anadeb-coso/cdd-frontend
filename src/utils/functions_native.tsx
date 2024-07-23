import React from "react";
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
// import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getImageDimensions = async (imageUri: string) => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      imageUri,
      (width, height) => {
        resolve({ width, height });
      },
      (error) => {
        reject(error);
      }
    );
  });
};


export const getImageSize = async (imageUri: string) => {
  let fileSizeInMB = 0;
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    const fileSizeInBytes = fileInfo.size;
    fileSizeInMB = fileSizeInBytes ? fileSizeInBytes / (1024 * 1024) : 0; // Convert bytes to MB
    //   console.log('Image size:', fileSizeInMB, 'MB');
  } catch (error) {
    console.error('Error getting image size:', error);
  }
  return fileSizeInMB;
};



// export const clearCache = async () => {
//   const cacheDir = RNFS.CachesDirectoryPath;
//   try {
//     await RNFS.unlink(cacheDir);
//     if (__DEV__) {
//       console.log('Cache cleared successfully');
//     }
//   } catch (err) {
//     if (__DEV__) {
//       console.log('Failed to clear cache', err);
//     }
//   }
// };

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

