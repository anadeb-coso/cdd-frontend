import { cddBaseURL } from '../env'
import { handleErrors } from '../API';
import {getData} from "../../utils/storageManager";

class FacilitatorsAPI {

  async get_no_sql_dbs_names() {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'GET',
      headers: myHeaders,
    };
    console.log(cddBaseURL)
    const result = fetch(
      `${cddBaseURL}api/process_manager/get-facilitator-no-sql-dbs-names?username=${JSON.parse(await getData('username'))}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

}

export default FacilitatorsAPI;
