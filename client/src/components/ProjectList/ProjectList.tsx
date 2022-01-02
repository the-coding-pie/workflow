import React, { useState } from "react";
import projects from "../../data/projects.ts";
import { ProjectObj } from "../../types";
import ProjectItem from "./ProjectItem";

const ProjectList = () => {
  const [currentActive, setCurrentActive] = useState();

  return (
    <ul className="project-list">
      {projects.length > 0 ? (
        projects.map((project: ProjectObj) => {
          return (
            <ProjectItem
              setCurrentActive={setCurrentActive}
              key={project._id}
              project={project}
            />
          );
        })
      ) : (
        <li>No Projects</li>
      )}
    </ul>
  );
};

export default ProjectList;
