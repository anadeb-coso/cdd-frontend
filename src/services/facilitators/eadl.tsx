import { cddBaseURL } from '../env'

// Remplace l'ancien accès direct à la base CouchDB partagée `eadls`
// (utils/coucdb_call.js::getDocumentsByAttributes({type:'adl', 'representative.email': email}, ..., "eadls"))
// : `eadls` est désormais Postgres côté GRM et n'est plus accessible en direct depuis le mobile.
// Passe par le nouveau endpoint proxy du backend CDD (authentication/api/facilitators/eadl-by-email/).
// Renvoie la même forme `{ docs: [...] }` qu'un ancien résultat Mango CouchDB `_find`, pour ne pas
// avoir à changer le code appelant existant (`response.docs[0].administrative_regions_objects`, etc.).
export async function getEadlByEmail(email: string) {
  try {
    const response = await fetch(
      `${cddBaseURL}authentication/api/facilitators/eadl-by-email/?email=${encodeURIComponent(email)}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } },
    );
    if (response.status === 404) {
      return { docs: [] };
    }
    const eadl = await response.json();
    return { docs: eadl && !eadl.error ? [eadl] : [] };
  } catch (error) {
    return { docs: [] };
  }
}
