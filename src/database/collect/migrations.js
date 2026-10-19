import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

// Toute évolution de `schema.js` incrémente sa version ET ajoute ici l'étape correspondante
// (addColumns / createTable), pour ne jamais perdre les saisies locales non synchronisées.
export const migrations = schemaMigrations({
  migrations: [
    {
      // Réglage « un seul enregistrement par personne » (faux pour les formulaires déjà chargés,
      // corrigé à la synchronisation suivante).
      toVersion: 2,
      steps: [
        addColumns({ table: 'collect_forms', columns: [{ name: 'single_submission', type: 'boolean' }] }),
      ],
    },
  ],
});
