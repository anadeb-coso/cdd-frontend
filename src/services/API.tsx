import { cddBaseURL } from './env'
import axios from 'axios';
const baseURL = cddBaseURL;
export { baseURL };

export function handleErrors(response) {
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
    // console.log(baseURL);
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

  async sync_geolocation_datas(data) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
    };

    const result = fetch(
      `${baseURL}process_manager/save-geolocation-form-datas/`,
      requestOptions,
    )
      .then(response => response.json())
      .then(handleErrors)
      .then(a => a)
      .catch(error => ({ error }));
    return result;
  }

  // --- Partage entre villages sièges (Task.share_mode, form builder web) ---

  // Signale l'achèvement d'une tâche partageable (en plus de l'écriture
  // directe CouchDB déjà faite par insertTaskToLocalDb) : alimente le
  // registre TaskShareRecord côté backend. Best-effort, n'importe jamais.
  async reportTaskCompletion(data: any) {
    return fetch(`${baseURL}process_manager/task-share/report-completion/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .catch(error => ({ ok: false, error }));
  }

  // Existe-t-il une tâche jumelle déjà achevée dont les champs partageables
  // peuvent être chargés dans la tâche courante (pas encore renseignée) ?
  async pullableTaskSource(params: {
    task_sql_id: number | string;
    administrative_level_id: number | string;
    project_id: number | string;
    cycle_id?: number | string | null;
  }) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return fetch(`${baseURL}process_manager/task-share/pullable-source/?${qs}`)
      .then(response => response.json())
      .catch(error => ({ found: false, error }));
  }

  // Fusionne les valeurs partageables de la tâche source dans la tâche
  // cible (directement dans la base CouchDB du facilitateur courant).
  async pullTaskData(data: any) {
    return fetch(`${baseURL}process_manager/task-share/pull-from/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .catch(error => ({ ok: false, error }));
  }

//   async sync_geolocation_datas(data) {
//     const myHeaders = new Headers();
//     myHeaders.append('Content-Type', 'application/json');
//     const requestOptions = {
//       method: 'POST',
//       headers: myHeaders,
//       body: JSON.stringify(data),
//     };

//     const result = axios.post(`${baseURL}process_manager/save-geolocation-form-datas/`, {
//       data: JSON.stringify(data)
//     })
//     .then(response => {
//       console.log(response.data)
//       return response.data
//     })
//     .then(handleErrors)
//     .then(a => a)
//     .catch(error => ({ error }));
// // console.log(result)
//     // const result = fetch(
//     //   `${baseURL}process_manager/save-geolocation-form-datas/`,
//     //   requestOptions,
//     // )
//     //   .then(response => response.json())
//     //   .then(handleErrors)
//     //   .then(a => a)
//     //   .catch(error => ({ error }));
//     return result;
//   }


}
export default API;
