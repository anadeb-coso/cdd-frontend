import React from "react";
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';

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
