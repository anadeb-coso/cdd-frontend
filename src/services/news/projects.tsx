import { cddBaseURL } from '../env'
import { handleErrors } from '../API';

class ProjectAPI {

  async get_projects(
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
    // console.log(misBaseURL);
    const result = fetch(
      `${cddBaseURL}api/news/get-projects/?${page ? 'page=' + page : ''}${page_size ? '&page_size=' + page_size : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


}

export default ProjectAPI;