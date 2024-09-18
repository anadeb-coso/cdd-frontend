import { cddBaseURL } from '../env'
import { handleErrors } from '../API';
import {getData} from "../../utils/storageManager";

class NewsFilesAPI {

  async get_news_files(
    data: any,
    administrativelevel_id: undefined | null | number = null,
    cvd_id: undefined | null | number = null,
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
    // console.log(cddBaseURL);
    const project = JSON.parse(await getData('project'));
    const result = fetch(
      `${cddBaseURL}api/news/get-news-files/?${page ? 'page=' + page : ''}${page_size ? '&page_size=' + page_size : ''}${administrativelevel_id ? '&administrativelevel_id=' + administrativelevel_id : ''}${cvd_id ? '&cvd_id=' + cvd_id : ''}${project ? '&project_name=' + project.name : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async search_new_file(
    data: any,
    new_id: undefined | null | number = null,
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
      `${cddBaseURL}api/news/search-news-files/?${page ? 'page=' + page : ''}${page_size ? '&page_size=' + page_size : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


  async save_new_file(
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
      `${cddBaseURL}api/news/save-news-file/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }
  

  async delete_new_file(
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
      `${cddBaseURL}api/news/delete-news-file/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


}

export default NewsFilesAPI;