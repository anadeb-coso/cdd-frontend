import { misBaseURL } from '../env'
import { handleErrors } from '../API';
import {getData} from "../../utils/storageManager";

class SubprojectAPI {

  async get_subprojects(
    data: any,
    token: string,
    administrativelevel_id: undefined | null | number = null,
    cvd_id: undefined | null | number = null,
    subproject_id: undefined | null | number = null,
    page: undefined | null | number = null,
    page_size: undefined | null | number = null,
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    // myHeaders.append('Authorization', `Bearer ${token}`);
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    
    const project = JSON.parse(await getData('project'));
    const result = fetch(
      `${misBaseURL}api/subprojects/get-subprojects-by-user/?${page ? 'page=' + page : ''}&${page_size ? 'page_size=' + page_size : ''}&${administrativelevel_id ? 'administrativelevel_id=' + administrativelevel_id : ''}&${cvd_id ? 'cvd_id=' + cvd_id : ''}&${subproject_id ? 'subproject_id=' + subproject_id : ''}&${project ? 'project_name=' + project.name : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async get_subproject(
    data: any,
    token: string,
    subproject_id: number,
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
      `${misBaseURL}api/subprojects/get-subproject-by-user/${subproject_id}/?${page ? 'page=' + page : ''}&${page_size ? 'page_size=' + page_size : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async save_subproject_geolocation(
    data: any,
    token: string,
    subproject_id: number
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
      `${misBaseURL}api/subprojects/save-subproject-geolocation/${subproject_id}/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async save_subproject(
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
      `${misBaseURL}api/subprojects/save-subproject/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


}

export default SubprojectAPI;