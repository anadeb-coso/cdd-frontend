import { cddBaseURL } from '../env'
import { handleErrors } from '../API';

class CategoryAPI {

  async get_categories(
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
    // console.log(cddBaseURL);
    const result = fetch(
      `${cddBaseURL}api/news/get-categories/?${page ? 'page=' + page : ''}${page_size ? '&page_size=' + page_size : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  async get_category(
    data: any,
    category_id: number,
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
      `${cddBaseURL}api/news/get-category/${category_id}/?${page ? 'page=' + page : ''}${page_size ? '&page_size=' + page_size : ''}`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


}

export default CategoryAPI;