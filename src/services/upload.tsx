import { Platform } from 'react-native';

import { handleErrors } from './API';

export async function uploadFile (
    url: string,
    data: any
) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'multipart/form-data');

    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
        formData.append(`${key}`, value as any);
    }
    formData.append('file', {
        uri:
            Platform.OS === 'android'
                ? data?.url
                : data?.url.replace('file://', ''),
        name: `${data?.url.split('/')[data?.url.split('/').length-1]}`,
        type: (data?.url.includes('.pdf') ? 'application/pdf' : 'image/*'), //'image/jpeg' // it may be necessary in Android.
    });


    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formData,
    };
    
    const result = fetch(
        url,
        requestOptions,
    )
        .then(response => response.json())
        .then(handleErrors)
        .then(a => a)
        .catch(error => ({ error }));
        
    return result;
}