import { misBaseURL } from '../env'
import { handleErrors } from '../API';

class SubprojectAPI {

  async get_subprojects(
    data: any,
    administrativelevel_id: undefined | null | number = null,
    cvd_id: undefined | null | number = null,
    project_id: undefined | null | number = null,
    page: undefined | null | number = null,
    page_size: undefined | null | number = null
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    // console.log(misBaseURL);
    const result = fetch(
      `${misBaseURL}api/subprojects/get-subprojects-by-user/?${page ? 'page=' + page : ''}&${page_size ? 'page_size=' + page_size : ''}&${administrativelevel_id ? 'administrativelevel_id=' + administrativelevel_id : ''}&${cvd_id ? 'cvd_id=' + cvd_id : ''}&${project_id ? 'project_id=' + project_id : ''}`,
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
    subproject_id: number,
    page: undefined | null | number = null,
    page_size: undefined | null | number = null
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
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
    subproject_id: number
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
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