import { misBaseURL } from '../env'
import { handleErrors } from '../API';

class AdministrativelevlsAPI {

  async get_administrativelevls(
        data: any, 
        type_adl: string, 
        parent_id: undefined | null | number = null, 
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
    const result = fetch(
      `${misBaseURL}api/administrativelevels/get-administrative-levels-by-user/${type_adl}/${project_id}/?${page ? 'page='+page : ''}&${page_size ? 'page_size='+page_size : ''}&${parent_id ? 'parent_id='+parent_id : ''}`,
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
  const result = fetch(
    `${misBaseURL}api/administrativelevels/get-cvds-by-user/${project_id}/?${page ? 'page='+page : ''}&${page_size ? 'page_size='+page_size : ''}&${parent_id ? 'parent_id='+parent_id : ''}`,
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