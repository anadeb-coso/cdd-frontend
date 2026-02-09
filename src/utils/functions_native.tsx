import React from "react";
import { Image, Alert, Platform, ToastAndroid, View, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
// import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDFDocument, rgb } from 'pdf-lib';
import * as Location from 'expo-location';
import ReactNativeBlobUtil from 'react-native-blob-util';
import * as mime from 'react-native-mime-types';
import { range } from './functions';
import { couchDBURLBase } from './databaseManager';


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


export const getImageSize = async (imageUri: string): Promise<number> => {
  let fileSizeInMB = 0;
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);

    if (fileInfo.exists && fileInfo.size) {
      fileSizeInMB = fileInfo.size / (1024 * 1024); // Convert bytes to MB
    }

    // console.log('Image size:', fileSizeInMB, 'MB');
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


//Compress PDF
const readPDF = async (uri: string) => {
  try {
    const pdfData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return pdfData;
  } catch (error) {
    console.error(error);
  }
};

// export const compressPDF = async (uri: string, compress: number = 0.5) => {
//   const _compressPDF = async (pdfData: any, compress: number = 0.5) => {
//     const pdfDoc = await PDFDocument.load(pdfData);

//     // Example: Optimize the PDF by downscaling images
//     const pages = pdfDoc.getPages();
//     for (const page of pages) {
//       const images = page.node.Annots?.map((annot: any) => annot.A.get());
//       for (const image of images) {
//         const [imageStream] = await image.embedImages();
//         // You can resize or compress the image here
//         // Example: Downscale the image
//         const imageDims = imageStream.scale(compress);
//         page.drawImage(imageStream, {
//           x: 0,
//           y: 0,
//           width: imageDims.width,
//           height: imageDims.height,
//         });
//       }
//     }

//     const compressedPdfBytes = await pdfDoc.saveAsBase64();
//     return compressedPdfBytes;
//   };

//   const saveCompressedPDF = async (compressedPdfData: any, outputUri: string) => {
//     try {
//       await FileSystem.writeAsStringAsync(outputUri, compressedPdfData, { encoding: FileSystem.EncodingType.Base64 });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const compressAndSavePDF = async (inputUri: string, outputUri: string) => {
//     const pdfData = await readPDF(inputUri);
//     const compressedPdfData = await _compressPDF(pdfData, compress);
//     await saveCompressedPDF(compressedPdfData, outputUri);
//   };

//   const inputUri: string = uri;
//   const fileNameWithExtension = uri.split('/')[uri.split('/').length - 1];

//   const fileName = fileNameWithExtension.split('.')[0];
//   const fileExtension = fileNameWithExtension.split('.')[1];

//   const outputFileNameWithExtension = `${fileName}_output.${fileExtension}`;

//   const outputUri: string = [
//     ...(uri.split('/').filter((e: any, i: number) => i != uri.split('/').length - 1)),
//     outputFileNameWithExtension
//   ].join("/");


//   await compressAndSavePDF(inputUri, outputUri);

//   return outputUri;
// };

// export const compressPDF = async (uri: string, compress: number = 0.5) => {
//   const _compressPDF = async (pdfData: any, compress: number = 0.5) => {
//     const pdfDoc = await PDFDocument.load(pdfData);
// console.log(compress)
//     // Example: Optimize the PDF by downscaling images
//     const pages = pdfDoc.getPages();
//     for (const page of pages) {
//       const images = page.node.Resources.XObject || {};
//       for (const key in images) {
//         const image = images[key];
//         if (image && image.embedImages) {
//           const [imageStream] = await image.embedImages();
//           const imageDims = imageStream.scale(compress);
//           page.drawImage(imageStream, {
//             x: 0,
//             y: 0,
//             width: imageDims.width,
//             height: imageDims.height,
//           });
//         }
//       }
//     }

//     const compressedPdfBytes = await pdfDoc.saveAsBase64();
//     return compressedPdfBytes;
//   };

//   const saveCompressedPDF = async (compressedPdfData: any, outputUri: string) => {
//     try {
//       await FileSystem.writeAsStringAsync(outputUri, compressedPdfData, { encoding: FileSystem.EncodingType.Base64 });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const compressAndSavePDF = async (inputUri: string, outputUri: string) => {
//     const pdfData = await readPDF(inputUri);
//     const compressedPdfData = await _compressPDF(pdfData, compress);
//     await saveCompressedPDF(compressedPdfData, outputUri);
//   };

//   const readPDF = async (uri: string) => {
//     try {
//       const pdfData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
//       return pdfData;
//     } catch (error) {
//       console.error('Error reading PDF:', error);
//       throw error;
//     }
//   };

//   const inputUri: string = uri;
//   const fileNameWithExtension = uri.split('/')[uri.split('/').length - 1];
//   const fileName = fileNameWithExtension.split('.')[0];
//   const fileExtension = fileNameWithExtension.split('.')[1];
//   const outputFileNameWithExtension = `${fileName}_output.${fileExtension}`;
//   const outputUri: string = [
//     ...(uri.split('/').filter((e: any, i: number) => i != uri.split('/').length - 1)),
//     outputFileNameWithExtension
//   ].join("/");

//   await compressAndSavePDF(inputUri, outputUri);

//   return outputUri;
// };

// export const compressPDF = async (uri: string, compress: number = 0.5) => {
//   const _compressPDF = async (pdfData: any, compress: number = 0.5) => {
//     const pdfDoc = await PDFDocument.load(pdfData);

//     // Compress images in the PDF
//     const pages = pdfDoc.getPages();
//     for (const page of pages) {
//       const { width, height } = page.getSize();
//       const newPage = pdfDoc.addPage([width, height]);

//       newPage.drawPage(page);

//       const images = page.node.Resources.XObject || {};
//       for (const key in images) {
//         const image = images[key];
//         if (image && image.embedImages) {
//           const [imageStream] = await image.embedImages();
//           const imageDims = imageStream.scale(compress);

//           newPage.drawImage(imageStream, {
//             x: 0,
//             y: 0,
//             width: imageDims.width,
//             height: imageDims.height,
//           });
//         }
//       }

//       pdfDoc.removePage(pdfDoc.getPageCount() - 2);
//     }

//     // Remove metadata
//     pdfDoc.setProducer('');
//     pdfDoc.setCreator('');

//     const compressedPdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
//     return compressedPdfBytes;
//   };

//   const saveCompressedPDF = async (compressedPdfData: any, outputUri: string) => {
//     try {
//       await FileSystem.writeAsStringAsync(outputUri, compressedPdfData.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const compressAndSavePDF = async (inputUri: string, outputUri: string) => {
//     const pdfData = await readPDF(inputUri);
//     const compressedPdfData = await _compressPDF(pdfData, compress);
//     await saveCompressedPDF(compressedPdfData, outputUri);
//   };

//   const readPDF = async (uri: string) => {
//     try {
//       const pdfData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
//       return pdfData;
//     } catch (error) {
//       console.error('Error reading PDF:', error);
//       throw error;
//     }
//   };

//   const inputUri: string = uri;
//   const fileNameWithExtension = uri.split('/')[uri.split('/').length - 1];
//   const fileName = fileNameWithExtension.split('.')[0];
//   const fileExtension = fileNameWithExtension.split('.')[1];
//   const outputFileNameWithExtension = `${fileName}_output.${fileExtension}`;
//   const outputUri: string = [
//     ...(uri.split('/').filter((e: any, i: number) => i != uri.split('/').length - 1)),
//     outputFileNameWithExtension
//   ].join("/");

//   await compressAndSavePDF(inputUri, outputUri);

//   return outputUri;
// };



export const covered_location = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      "Alert", `Nous rencontrons des problèmes pour avoir des autorisations à votre position!`, [
      { text: "ok", onPress: async () => { } }
    ]);
    return;
  }

  await Location.getCurrentPositionAsync({
    // accuracy: Location.Accuracy.High,
    // mayShowUserSettingsDialog: true
  })
    .then((pos: any) => {

    })
    .catch((err: any) => {

    });

}


export const getFileType = async (url: string, username: string, password: string) => {
    const filename = url.split('/').pop();
    const mimeTypeFromExt = filename ? mime.lookup(filename) : null;

    if (mimeTypeFromExt) return mimeTypeFromExt;

    // Si extension inconnue, tente HEAD
    let config = {}
    if(!["", null, undefined].includes(username)){
      const base64Creds = btoa(`${username}:${password}`);
        config = {
          Authorization: `Basic ${base64Creds}`,
          username: username,
          password: password,
        }
      }
    const res = await fetch(url, {
        method: 'HEAD',
        headers: config
    });

    return res.headers.get('Content-Type');
};

export const downloadToDownloadsFolder = async (url: string, username: string, password: string, progressCallback  = (arg?: any) => null) => {
    try {
    
        if (!url.includes("http")) {
            url = couchDBURLBase + url;
        }

        const url_split = url.split("?")[0].split("/");
        const filename = url_split[url_split.length - 1];

        const dirs = ReactNativeBlobUtil.fs.dirs; // Chemin vers le dossier "Downloads" (Android) ou "Documents" (iOS)

        // Android: utilise le dossier Downloads
        // iOS: utilise le dossier Documents (car iOS n'autorise pas l'accès direct à Downloads)

        const downloadDir = Platform.OS === 'android' ? dirs.DownloadDir : dirs.DocumentDir;

        const path = `${downloadDir}/${filename}`;

        const fileExists = await ReactNativeBlobUtil.fs.exists(path);
        
        if (!fileExists) {
            // console.log("Téléchargement vers:", path);

            let config = {}
            if(!["", null, undefined].includes(username)){
              const base64Creds = btoa(`${username}:${password}`);
              config = {
                Authorization: `Basic ${base64Creds}`,
                username: username,
                password: password,
              }
            }

            // Télécharge le fichier
            const mime = await getFileType(filename, username, password);
            const res = await ReactNativeBlobUtil.config({
                fileCache: true,
                path,
                addAndroidDownloads: {
                    useDownloadManager: true, // Utilise le gestionnaire de téléchargement Android (notification + stockage visible)
                    notification: true,
                    title: `Téléchargement de ${filename}`,
                    description: "Fichier en cours de téléchargement...",
                    mime: mime ? mime : undefined, // (Optionnel) Définir le type MIME (ex: 'application/pdf')
                },
            }).fetch('GET', url, config).progress((received: any, total: any) => {
                const progress = received / total;
                // console.log(`Progression: ${(progress * 100).toFixed(2)}%`);
                progressCallback(progress);
            });

            // console.log("Fichier téléchargé avec succès:", path);
            return path;
        }

    } catch (error) {
        console.error("Erreur de téléchargement:", error);
        progressCallback(-1); // Signal d'erreur
        // throw error;
    }
    return null;
};
