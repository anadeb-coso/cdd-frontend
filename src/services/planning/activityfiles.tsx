import { cddBaseURL } from '../env'
import { handleErrors } from '../API';
import {getData} from "../../utils/storageManager";

class ActivityFilesAPI {


  async save_activity_file(
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
      `${cddBaseURL}api/planning/save-activity-file/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }
  

  async delete_activity_file(
    data: any
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
        
    const project = JSON.parse(await getData('project'));
    const username = JSON.parse(await getData('username'));

    data = {...data, project: project.id, username: username}
    
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${cddBaseURL}api/planning/delete-activity-file/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


}

export default ActivityFilesAPI;