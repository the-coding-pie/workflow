import React, { useState } from "react";
import { ProjectObj } from "../../types";
import Avatar from "react-avatar";
import {
  HiChevronRight,
  HiChevronDown,
  HiOutlineDotsHorizontal,
  HiOutlinePlus,
} from "react-icons/hi";
import BoardList from "./BoardList";
import { NavLink } from "react-router-dom";

interface Props {
  project: ProjectObj;
  currentActive: string | null;
  setCurrentActive: React.Dispatch<React.SetStateAction<string | null>>;
}

const ProjectItem = ({ project, setCurrentActive, currentActive }: Props) => {
  const [showIcons, setShowIcons] = useState(false);

  const [isCurrentProject, setIsCurrentProject] = useState(false);

  return (
    <li
      className="project-item noselect "
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
    >
      <div
        className={`project px-2 relative py-2 w-full flex items-center justify-between cursor-pointer ${
          isCurrentProject ? "bg-violet-200" : "hover:bg-stone-100"
        }`}
        onClick={() => {
          setCurrentActive((prevValue) => {
            if (prevValue === project._id) {
              return null;
            }
            return project._id;
          });
        }}
      >
        {isCurrentProject && (
          <span className="absolute inset-y-0 left-0 w-1 bg-violet-500 rounded-tr-xl rounded-br-xl"></span>
        )}
        <div className="left flex items-center">
          <div className="down-icon mr-1 text-gray-600">
            {currentActive === project._id ? (
              <HiChevronDown size={16} />
            ) : (
              <HiChevronRight size={16} />
            )}
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
            {project.name.length > 10 ? (
              <NavLink
                end
                to={`/p/${project._id}`}
                className={({ isActive }) => {
                  setIsCurrentProject(isActive);

                  return `text-sm hover:underline decoration-dashed outline-violet-500 underline-offset-4`;
                }}
              >
                {project.name.slice(0, 10) + "..."}
              </NavLink>
            ) : (
              <NavLink
                end
                to={`/p/${project._id}`}
                className={({ isActive }) => {
                  setIsCurrentProject(isActive);

                  return `text-sm hover:underline decoration-dashed outline-violet-500 underline-offset-4`;
                }}
              >
                {project.name}
              </NavLink>
            )}
          </div>
        </div>
        {showIcons && (
          <div className="right text-gray-600 flex items-center">
            <button className="mr-1">
              <HiOutlineDotsHorizontal size={16} />
            </button>
            <button>
              <HiOutlinePlus size={16} />
            </button>
          </div>
        )}
      </div>
      {currentActive === project._id && (
        <BoardList projectId={project._id} boards={project.boards} />
      )}
    </li>
  );
};

export default ProjectItem;
