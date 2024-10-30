import { cddBaseURL } from '../env'
import { handleErrors } from '../API';
import {getData} from "../../utils/storageManager";

class ActivitiesAPI {

  async get_activities(
    data: any
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    
    const project = JSON.parse(await getData('project'));
    const username = JSON.parse(await getData('username'));

    data = {...data, project_id: project.id}
    if(JSON.parse(await getData('groups')).includes('Facilitator')){
        data = {...data, facilitator__username: username}
    }else{
        data = {...data, user__username: username}
    }

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${cddBaseURL}api/planning/get-activities/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


  async get_activity(
    id: number,
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({}),
    };
    const result = fetch(
      `${cddBaseURL}api/planning/get-activity/${id}/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


  async save_activity(
    data: any
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
        
    const project = JSON.parse(await getData('project'));
    const username = JSON.parse(await getData('username'));
    const password = JSON.parse(await getData('password'));

    data = {...data, project: project.id, username: username, password: password}
    
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${cddBaseURL}api/planning/save-activity/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async delete_activity(
    data: any
  ) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
        
    const project = JSON.parse(await getData('project'));
    const username = JSON.parse(await getData('username'));
    const password = JSON.parse(await getData('password'));

    data = {...data, project: project.id, username: username, password: password}
    
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${cddBaseURL}api/planning/delete-activity/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

}

export default ActivitiesAPI;