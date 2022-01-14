import React, { useState } from "react";
import projects from "../../data/projects.ts";
import { showModal } from "../../redux/features/modalSlice";
import { ProjectObj } from "../../types";
import ProjectItem from "./ProjectItem";

const ProjectList = () => {
  const [currentActive, setCurrentActive] = useState<null | string>(null);

  return (
    <ul className="project-list">
      {projects.length > 0 ? (
        projects.map((project: ProjectObj) => {
          return (
            <ProjectItem
              currentActive={currentActive}
              setCurrentActive={setCurrentActive}
              key={project._id}
              project={project}
            />
          );
        })
      ) : (
        <li className="px-6 text-sm py-1">
          Start a
          <button className="ml-1 underline text-violet-500 decoration-dashed outline-violet-500 underline-offset-4">
            new project
          </button>
        </li>
      )}
    </ul>
  );
};

export default ProjectList;
