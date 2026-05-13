import { misBaseURL } from '../env'
import { cddBaseURL } from '../env'
import { handleErrors } from '../API';
import { getData } from "../../utils/storageManager";

class AdministrativelevlsAPI {

  async get_administrativelevels(
    data: any,
    type_adl: string,
    parent_id: undefined | null | number = null,
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
    const project = JSON.parse(await getData('project'));
    const result = fetch(
      `${misBaseURL}api/administrativelevels/get-administrative-levels-by-user/${type_adl}/${project.name}/?${page ? 'page=' + page : ''}&${page_size ? 'page_size=' + page_size : ''}&${parent_id ? 'parent_id=' + parent_id : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


  async get_simple_administrativelevels(
    data: any,
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
    const project = JSON.parse(await getData('project'));
    
    const result = fetch(
      `${misBaseURL}api/administrativelevels/get-administrative-levels/?${page ? 'page=' + page : ''}&${page_size ? 'page_size=' + page_size : ''}&${(project && project.name) ? 'project_name=' + project.name : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async get_cvds(
    data: any,
    parent_id: undefined | null | number = null,
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
    const project = JSON.parse(await getData('project'));
    const result = fetch(
      `${misBaseURL}api/administrativelevels/get-cvds-by-user/${project.name}/?${page ? 'page=' + page : ''}&${page_size ? 'page_size=' + page_size : ''}&${parent_id ? 'parent_id=' + parent_id : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


  async administrativeLevelsFilterByAdministrativeRegion(username: any, administrative_region: any, filter: any) {
    console.log(username);
    console.log(cddBaseURL)
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    let d = ""
    for (var [key, value] of Object.entries(filter)) {
      d += "&" + key + "=" + value;
    }
    const requestOptions = {
      method: 'GET',
      headers: myHeaders
    };
    const result = fetch(`${cddBaseURL}api/administrative-levels/filter-by-administrative-region/?email=${username}&administrative_region=${administrative_region}${d}`, requestOptions)
      .then((response) => response.json())
      .then(handleErrors)
      .then((response) => response)
      .catch((error) => ({ error }));
    return result;
  }

  async save_administrative_level_geolocation(
    data: any,
    adl_id: number
  ) {
    console.log(misBaseURL)
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${misBaseURL}api/administrative-levels/save-administrative-level-geolocation/${adl_id}/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


}

export default AdministrativelevlsAPI;
