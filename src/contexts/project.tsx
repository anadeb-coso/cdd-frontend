import React, { createContext, useState } from 'react';

interface ProjectContextData {
  selectedProject: any;
  selectProject(project: any): void;
}

const ProjectContext = createContext<ProjectContextData>({} as ProjectContextData);

export const ProjectProvider: React.FC = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<string>(null);
  function selectProject(project: any) {
    setSelectedProject(project);
  }

  return (
    <ProjectContext.Provider value={{ selectedProject, selectProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectContext;
