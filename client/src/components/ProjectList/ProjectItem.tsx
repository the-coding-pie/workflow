import React from "react";
import { ProjectObj } from "../../types";
import { BiCaretRight } from "react-icons/bi";
import Avatar from "react-avatar";

interface Props {
  project: ProjectObj;
}

const ProjectItem = ({ project }: Props) => {
  return (
    <div className="project px-4 py-2 w-full flex items-center justify-between cursor-pointer">
      <div className="left flex items-center">
        <div className="down-icon mr-1 text-gray-600">
          <BiCaretRight />
        </div>
        <div className="name">
          {project.icon ? (
            <Avatar
              src={project.icon}
              alt="project icon"
              className="rounded mr-1.5"
              size="18"
              textSizeRatio={1.75}
            />
          ) : (
            <Avatar
              name={project.name}
              className="rounded mr-1.5"
              size="18"
              textSizeRatio={1.75}
            />
          )}
          {project.name.length > 10 ? <span className="text-sm">{project.name.slice(0, 10) + "..."}</span> : <span className="text-sm">{project.name}</span>}
        </div>
      </div>
      <div className="right"></div>
    </div>
  );
};

export default ProjectItem;
