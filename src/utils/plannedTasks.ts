// Fusion des activités du calendrier (Planning/CalendarScreen.tsx::get_tasks_planned), chargées
// mois par mois.

const dayOf = (value: any): string | null => (typeof value === 'string' && value ? value.split('T')[0] : null);

// Vrai si le serveur renvoie `task` pour la période [startDate, endDate] (dates 'YYYY-MM-DD') :
// même critère que cdd-backend planning/api/views.py::RestGetActivityByAttributes (activité
// ponctuelle, plage de plusieurs jours qui chevauche la période, ou date de retour de congés).
export const isTaskInDateWindow = (task: any, startDate: string, endDate: string): boolean => {
  const planned = dayOf(task?.planned_date);
  const start = dayOf(task?.planned_datetime_start);
  const end = dayOf(task?.planned_datetime_end);
  const vacationReturn = dayOf(task?.vacation_return_datetime);
  return Boolean(
    (planned && planned >= startDate && planned <= endDate)
    || (start && end && start <= endDate && end >= startDate)
    || (vacationReturn && vacationReturn >= startDate && vacationReturn <= endDate)
  );
};

// Les activités de la période rechargée sont remplacées par la réponse du serveur : une activité
// supprimée (ou déplacée hors de la période) disparaît, alors que la simple fusion par id la
// laissait affichée jusqu'au redémarrage de l'application. Celles des autres mois déjà chargés
// sont conservées.
export const mergePlannedTasks = (previousTasks: any[], fetchedTasks: any[], startDate: string, endDate: string): any[] => {
  const fetchedIds = new Set(fetchedTasks.map((task: any) => task.id));
  const kept = (previousTasks ?? []).filter(
    (task: any) => !fetchedIds.has(task.id) && !isTaskInDateWindow(task, startDate, endDate),
  );
  return [...kept, ...fetchedTasks];
};
