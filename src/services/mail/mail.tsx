import { cddBaseURL } from '../env'
import { handleErrors } from '../API';
import {getData} from "../../utils/storageManager";
import { apiSecret } from '../../utils/apiCredentials';

class SendMailAPI {

  async send_mail(
    data: any
  ) {
    const myHeaders = new Headers();

    myHeaders.append('Content-Type', 'application/json');
        
    const project = JSON.parse(await getData('project'));
    const username = JSON.parse(await getData('username'));
    const secret = await apiSecret();

    data = {...data, project: project.id, username: username, ...secret}
    
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };

    
    const result = fetch(
      `${cddBaseURL}api/send-mail/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

}

export default SendMailAPI;
