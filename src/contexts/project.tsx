import React, { createContext, useState, ReactNode, useContext, useEffect, useRef } from 'react';

import AuthContext from './auth';
import { getData, storeData } from '../utils/storageManager';

interface ProjectContextData {
  selectedProject: any;
  selectProject(project: any): void;
}

const ProjectContext = createContext<ProjectContextData>({} as ProjectContextData);

/**
 * Projet choisi pour la session. Il n'appartient qu'à la session en cours :
 * - remis à zéro à chaque connexion et déconnexion (sinon le projet du compte précédent restait choisi alors que
 *   le stockage, vidé à la déconnexion, ne le contenait plus : listes vides, changement de projet sans effet) ;
 * - un choix arrivant pendant qu'on est déconnecté est ignoré (l'écran « Choisir un projet », affiché un instant
 *   pendant la déconnexion, relisait et resélectionnait le projet encore stocké) ;
 * - toujours présent dans le stockage (`project`), lu par les écrans et les appels aux API.
 */
export const ProjectProvider: React.FC<{ children : ReactNode }> = ({ children }: { children : ReactNode }) => {
  const { signed } = useContext(AuthContext);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const signedRef = useRef(signed);
  signedRef.current = signed;

  useEffect(() => {
    setSelectedProject(null);
  }, [signed]);

  useEffect(() => {
    if (!selectedProject?.name) return;
    (async () => {
      const stored = JSON.parse((await getData('project')) || 'null');
      if (signedRef.current && stored?.name !== selectedProject.name) {
        await storeData('project', JSON.stringify(selectedProject));
      }
    })();
  }, [selectedProject]);

  function selectProject(project: any) {
    if (project && !signedRef.current) return;
    setSelectedProject(project);
  }

  return (
    <ProjectContext.Provider value={{ selectedProject, selectProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
