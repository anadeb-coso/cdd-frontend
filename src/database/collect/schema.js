/**
 * Base locale COSOCollect (WatermelonDB) : formulaires chargés et saisies, consultables et
 * remplissables hors connexion, synchronisés avec le Web DCC (api/coso-collect/).
 *
 * Chaque ligne porte `owner_key` (identifiant du compte connecté) : plusieurs comptes peuvent se
 * succéder sur un même appareil sans voir les données des autres, et sans perdre les saisies pas
 * encore synchronisées d'un compte déconnecté.
 */
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'collect_forms',
      columns: [
        { name: 'owner_key', type: 'string', isIndexed: true },
        { name: 'server_id', type: 'number', isIndexed: true },
        { name: 'uid', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'version', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'close_message', type: 'string' },
        // Un seul enregistrement par personne (réglage du formulaire sur le web) — ajouté en v2.
        { name: 'single_submission', type: 'boolean' },
        { name: 'form_json', type: 'string' },
        { name: 'title_template_json', type: 'string' },
        { name: 'published_at', type: 'string' },
        { name: 'downloaded_at', type: 'number' },
        { name: 'last_synced_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'collect_submissions',
      columns: [
        { name: 'owner_key', type: 'string', isIndexed: true },
        { name: 'uuid', type: 'string', isIndexed: true },
        { name: 'form_server_id', type: 'number', isIndexed: true },
        { name: 'form_version', type: 'number' },
        { name: 'data_json', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'title', type: 'string' },
        // Saisie envoyée rouverte à la modification par un administrateur (copie serveur).
        { name: 'editable', type: 'boolean' },
        // Modifiée localement depuis la dernière synchronisation réussie.
        { name: 'dirty', type: 'boolean', isIndexed: true },
        { name: 'sync_error_code', type: 'string', isOptional: true },
        { name: 'sync_error', type: 'string', isOptional: true },
        { name: 'created_at_local', type: 'string' },
        { name: 'submitted_at_local', type: 'string', isOptional: true },
        { name: 'server_updated_at', type: 'string', isOptional: true },
        { name: 'current_page', type: 'number' },
        { name: 'source', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
