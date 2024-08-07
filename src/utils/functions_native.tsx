import React from "react";
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
// import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PDFDocument, rgb } from 'pdf-lib';
import { range } from './functions';

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

export const compressPDF = async (uri: string, compress: number = 0.5) => {
  const _compressPDF = async (pdfData: any, compress: number = 0.5) => {
    const pdfDoc = await PDFDocument.load(pdfData);

    // Compress images in the PDF
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      const newPage = pdfDoc.addPage([width, height]);

      newPage.drawPage(page);

      const images = page.node.Resources.XObject || {};
      for (const key in images) {
        const image = images[key];
        if (image && image.embedImages) {
          const [imageStream] = await image.embedImages();
          const imageDims = imageStream.scale(compress);

          newPage.drawImage(imageStream, {
            x: 0,
            y: 0,
            width: imageDims.width,
            height: imageDims.height,
          });
        }
      }

      pdfDoc.removePage(pdfDoc.getPageCount() - 2);
    }

    // Remove metadata
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    const compressedPdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
    return compressedPdfBytes;
  };

  const saveCompressedPDF = async (compressedPdfData: any, outputUri: string) => {
    try {
      await FileSystem.writeAsStringAsync(outputUri, compressedPdfData.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });
    } catch (error) {
      console.error(error);
    }
  };

  const compressAndSavePDF = async (inputUri: string, outputUri: string) => {
    const pdfData = await readPDF(inputUri);
    const compressedPdfData = await _compressPDF(pdfData, compress);
    await saveCompressedPDF(compressedPdfData, outputUri);
  };

  const readPDF = async (uri: string) => {
    try {
      const pdfData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      return pdfData;
    } catch (error) {
      console.error('Error reading PDF:', error);
      throw error;
    }
  };

  const inputUri: string = uri;
  const fileNameWithExtension = uri.split('/')[uri.split('/').length - 1];
  const fileName = fileNameWithExtension.split('.')[0];
  const fileExtension = fileNameWithExtension.split('.')[1];
  const outputFileNameWithExtension = `${fileName}_output.${fileExtension}`;
  const outputUri: string = [
    ...(uri.split('/').filter((e: any, i: number) => i != uri.split('/').length - 1)),
    outputFileNameWithExtension
  ].join("/");

  await compressAndSavePDF(inputUri, outputUri);

  return outputUri;
};
