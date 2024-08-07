import { Platform } from 'react-native';
import { uploadAsync } from 'expo-file-system';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

import { misBaseURL } from '../env'
import { handleErrors } from '../API';
import { getData } from '../../utils/storageManager';

class SubprojectFileAPI {

  async uploadSubprojectFile(
    data: any
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'multipart/form-data');

    const formData = new FormData();
    // formData.append('username', data.username);
    // formData.append('password', data.password);
    // formData.append('id', data.id);
    // formData.append('subproject', data.subproject);
    // formData.append('subproject_step', data.subproject_step);
    // formData.append('subproject_level', data.subproject_level);
    // formData.append('name', data.name);
    // formData.append('url', data.url);
    // formData.append('order', data.order);
    // formData.append('date_taken', data.date_taken);
    // formData.append('file_type', data.file_type);
    // console.log("data");
    // console.log(data);
    for (const [key, value] of Object.entries(data)) {
      if (value != null && value != undefined) formData.append(`${key}`, value as any);
    }








    formData.append('file', {
      uri:
        Platform.OS === 'android'
          ? data?.url
          : data?.url.replace('file://', ''),
      name: `${data?.name}.${data?.url.split('.')[data?.url.split('.').length - 1]}`,
      type: (data?.url.includes('.pdf') ? 'application/pdf' : 'image/*'), //'image/jpeg' // it may be necessary in Android.
    });


    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
    };

    const result = fetch(
      `${misBaseURL}api/attachments/upload-to-subproject-step`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }



  async uploadSubprojectFileUploadAsync(
    data: any
  ) {
    let p: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value != null && value != undefined) p[`${key}`] = value as any;
    }
    const result = await uploadAsync(
      `${misBaseURL}api/attachments/upload-to-subproject-step`,
      Platform.OS === 'android' ? data?.url : data?.url.replace('file://', ''),
      {
        fieldName: 'file',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        ContentType: 'multipart/form-data',
        mimeType: data.file_type,//(data?.url.includes('.pdf') ? 'application/pdf' : 'image/*'),
        parameters: p,
      },
    );

    return result.body ? JSON.parse(result.body) : result;
  }


  async uploadSubprojectFileAxios(
    data: any
  ) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(`${key}`, value as any);
    }

    formData.append('file', {
      uri: Platform.OS === 'android' ? data?.url : data?.url.replace('file://', ''),
      name: data?.url.split('/').pop(),
      type: data?.url.includes('.pdf') ? 'application/pdf' : 'image/*',
    });

    try {
      const response = await axios.post(`${misBaseURL}api/attachments/upload-to-subproject-step`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await handleErrors(response.data);
      return result;
    } catch (error) {
      // return { error };
      if (axios.isAxiosError(error)) {
        console.log(error)
        return { error: error.message || 'Network Error' };
      }
      return { error: 'An unexpected error occurred' };
    }



  }


  async deleteSubprojectFileByUrl(
    data: any
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${misBaseURL}api/attachments/delete-subproject-file-by-url`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

}

export default SubprojectFileAPI;