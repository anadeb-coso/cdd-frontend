import { cddBaseURL } from '../env'
import { handleErrors } from '../API';
import { getData } from "../../utils/storageManager";
import { getDocumentsByAttributes } from '../../utils/coucdb_call';

class ProjectsAPI {

  async get_projects() {
    // try {
    //   let result_docs: any = [];
    //   await getDocumentsByAttributes({
    //     type: "project",
    //   }, 250, 0, "process_design")
    //     .then((result_2: any) => {
    //       result_docs = (result_2?.docs ?? []).map((e:any) => {
    //         return {id: e.sql_id,name: e.name, description: e.description, couch_id: e._id}
    //       });
    //     });
    //     return result_docs;
    // } catch (e) {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
      };

      const result = fetch(
        `${cddBaseURL}api/process_manager/get-facilitator-projects?username=${JSON.parse(await getData('username'))}`,
        requestOptions,
      )
        .then(response => response.json())
        .then(handleErrors)
        .then(a => a)
        .catch(error => ({ error }));
      return result;
    // }
  }


}

export default ProjectsAPI;
