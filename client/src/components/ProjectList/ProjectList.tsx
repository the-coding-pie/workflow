import React from "react";
import projects from "../../data/projects.ts";
import { ProjectObj } from "../../types";
import ProjectItem from "./ProjectItem";

const ProjectList = () => {
  return (
    <div className="project-list">
      {projects.length > 0 ? (
        projects.map((project: ProjectObj) => {
          return <ProjectItem key={project._id} project={project} />;
        })
      ) : (
        <div>No Projects</div>
      )}
    </div>
  );
};

export default ProjectList;
