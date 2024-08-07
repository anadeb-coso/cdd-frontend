import { cddBaseURL } from './env'
import axios from 'axios';
const baseURL = cddBaseURL;
export { baseURL };

export function handleErrors(response) {
  if (response.non_field_errors) {
    setTimeout(() => alert(response.non_field_errors[0]), 1000);
    throw Error(response.non_field_errors[0]);
  }
  return response;
}

class API {
  async login(data) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    console.log(baseURL);
    const result = fetch(
      `${baseURL}authentication/obtain-auth-credentials/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


  async sync_datas(data) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${baseURL}process_manager/save-form-datas/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async sync_geolocation_datas(data) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };

    const result = fetch(
      `${baseURL}process_manager/save-geolocation-form-datas/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }
//   async sync_geolocation_datas(data) {
//     const myHeaders = new Headers();
//     myHeaders.append('Content-Type', 'application/json');
//     const requestOptions = {
//       method: 'POST',
//       headers: myHeaders,
//       body: JSON.stringify(data),
//     };

//     const result = axios.post(`${baseURL}process_manager/save-geolocation-form-datas/`, {
//       data: JSON.stringify(data)
//     })
//     .then(response => {
//       console.log(response.data)
//       return response.data
//     })
//     .then(handleErrors)
//     .then(a => a)
//     .catch(error => ({ error }));
// // console.log(result)
//     // const result = fetch(
//     //   `${baseURL}process_manager/save-geolocation-form-datas/`,
//     //   requestOptions,
//     // )
//     //   .then(response => response.json())
//     //   .then(handleErrors)
//     //   .then(a => a)
//     //   .catch(error => ({ error }));
//     return result;
//   }


}
export default API;
