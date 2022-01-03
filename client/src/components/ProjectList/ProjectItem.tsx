import React, { useRef, useState } from "react";
import { ProjectObj } from "../../types";
import Avatar from "react-avatar";
import {
  HiChevronRight,
  HiChevronDown,
  HiOutlineDotsHorizontal,
  HiOutlinePlus,
} from "react-icons/hi";
import BoardList from "./BoardList";
import { NavLink, useLocation } from "react-router-dom";
import CustomNavLink from "../CustomNavLink/CustomNavLink";

interface Props {
  project: ProjectObj;
  currentActive: string | null;
  setCurrentActive: React.Dispatch<React.SetStateAction<string | null>>;
}

const ProjectItem = ({ project, setCurrentActive, currentActive }: Props) => {
  const [showIcons, setShowIcons] = useState(false);

  const { pathname } = useLocation();

  const [isCurrentProject, setIsCurrentProject] = useState(false);

  const ref = useRef<any>(null);

  return (
    <li
      className="project-item noselect "
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
    >
      <div
        className={`project px-2 relative py-2 w-full flex items-center justify-between cursor-pointer ${
          isCurrentProject ? "primary-color-light" : "secondary-color-hover"
        }`}
        onClick={(e) => {
          // when click, if it is in link, open it for the first time
          // no toggle
          // if it is not on link
          if (ref.current && !ref.current.contains(e.target)) {
            // toggling
            setCurrentActive((prevValue) => {
              if (prevValue === project._id) {
                return null;
              }
              return project._id;
            });
          } else {
            // if it is on link, open it only once, no toggling
            // if links are not same
            if (
              ![
                `/p/${project._id}/boards`,
                `/p/${project._id}/members`,
                `/p/${project._id}/settings`,
              ].includes(pathname)
            ) {
              setCurrentActive(project._id);
            }
          }
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
          <div className="name flex items-center">
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
            <div ref={ref}>
              {project.name.length > 10 ? (
                <CustomNavLink
                  to={`/p/${project._id}/boards`}
                  fn={setIsCurrentProject}
                  list={[
                    `/p/${project._id}/boards`,
                    `/p/${project._id}/members`,
                    `/p/${project._id}/settings`,
                  ]}
                >
                  {project.name.slice(0, 10) + "..."}
                </CustomNavLink>
              ) : (
                <CustomNavLink
                  to={`/p/${project._id}/boards`}
                  fn={setIsCurrentProject}
                  list={[
                    `/p/${project._id}/boards`,
                    `/p/${project._id}/members`,
                    `/p/${project._id}/settings`,
                  ]}
                >
                  {project.name}
                </CustomNavLink>
              )}
            </div>
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
