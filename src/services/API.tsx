// const baseURL = 'http://52.52.147.181/';
// const baseURL = 'https://cddanadeb.e3grm.org/';
const baseURL = 'http://cdd-env.eba-mz2nppu7.us-west-1.elasticbeanstalk.com/';
// const baseURL = 'http://10.0.2.2:8001/';
export { baseURL };
function handleErrors(response) {
  if (response.non_field_errors) {
    setTimeout(() => alert(response.non_field_errors[0]), 1000);
    throw Error(response.non_field_errors[0]);
  }
  return response;
}

class API {
  async login(data) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${baseURL}authentication/obtain-auth-credentials/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


  async sync_datas(data) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };
    const result = fetch(
      `${baseURL}process_manager/save-form-datas/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }


}
export default API;
