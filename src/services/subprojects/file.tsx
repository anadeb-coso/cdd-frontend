import { Platform } from 'react-native';
import { uploadAsync } from 'expo-file-system';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

import { misBaseURL } from '../env'
import { handleErrors } from '../API';
import { getData } from '../../utils/storageManager';

class SubprojectFileAPI {

  async uploadSubprojectFile(
    data: any,
    url: any = false
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
    for (const [key, value] of Object.entries(data)) {
      if (value != null && value != undefined) formData.append(`${key}`, value as any);
    }







    if (url) {
      formData.append('file', data?.url);
    } else {
      formData.append('file', {
        uri:
          Platform.OS === 'android'
            ? data?.url
            : data?.url.replace('file://', ''),
        name: `${data?.name}.${data?.url.split('.')[data?.url.split('.').length - 1]}`,
        type: (data?.url.includes('.pdf') ? 'application/pdf' : 'image/*'), //'image/jpeg' // it may be necessary in Android.
      });
    }



    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
    };

    const result = fetch(
      `${misBaseURL}api/attachments/${url ? "upload-to-subproject-step-url" : "upload-to-subproject-step"}`,
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
    data: any,
    url: any = false
  ) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(`${key}`, value as any);
    }

    if (url) {
      formData.append('file', data?.url);
    } else {
      formData.append('file', {
        uri: Platform.OS === 'android' ? data?.url : data?.url.replace('file://', ''),
        name: data?.url.split('/').pop(),
        type: data?.url.includes('.pdf') ? 'application/pdf' : 'image/*',
      });
    }

    try {
      const response = await axios.post(`${misBaseURL}api/attachments/${url ? "upload-to-subproject-step-url" : "upload-to-subproject-step"}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await handleErrors(response.data);
      return result;
    } catch (error) {
      // return { error };
      if (axios.isAxiosError(error)) {
        return { error: error.message || 'Network Error' };
      }
      return { error: 'An unexpected error occurred' };
    }



  }


  async addSubprojectFileAxios(
    data: any,
    isUrl: any = false
  ) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(`${key}`, value as any);
    }
    
    try {
      const response = await axios.post(`${misBaseURL}api/attachments/${isUrl ? "upload-to-subproject-step-url" : "upload-to-subproject-step"}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await handleErrors(response.data);
      return result;
    } catch (error) {
      // return { error };
      if (axios.isAxiosError(error)) {
        return { error: error.message || 'Network Error' };
      }
      return { error: 'An unexpected error occurred' };
    }

  }

    async addSubprojectFileUrl(
    data: any
  ) {

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append('Authorization', `Bearer ${token}`);
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${misBaseURL}api/attachments/upload-to-subproject-step-url`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;

  }


  async deleteSubprojectFileByUrl(
    data: any,
    token: string
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append('Authorization', `Bearer ${token}`);
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


  async get_file_comments(
    data: any,
    token: string,
    file_id: number,
    page: undefined | null | number = null,
    page_size: undefined | null | number = null
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append('Authorization', `Bearer ${token}`);
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${misBaseURL}api/subprojects/get-file-comments/${file_id}/`,
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