import { misBaseURL } from '../env'
import { handleErrors } from '../API';
import { getData } from "../../utils/storageManager";

class SubprojectDiagnosticAPI {

  async get_diagnostic_summary(
    data: any,
    token: string,
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
      `${misBaseURL}api/subprojects/get-subprojects-diagnostic-summary-by-user/?${project ? 'project_name=' + project.name : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async get_diagnostic_list(
    data: any,
    token: string,
    filter_type: string,
    status: undefined | null | string = null,
    designation: undefined | null | string = null,
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
      `${misBaseURL}api/subprojects/get-subprojects-diagnostic-list-by-user/?${page ? 'page=' + page : ''}&${page_size ? 'page_size=' + page_size : ''}&${filter_type ? 'filter_type=' + filter_type : ''}&${status ? 'status=' + encodeURIComponent(status) : ''}&${designation ? 'designation=' + designation : ''}&${project ? 'project_name=' + project.name : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

}

export default SubprojectDiagnosticAPI;
