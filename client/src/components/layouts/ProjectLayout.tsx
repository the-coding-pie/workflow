import React from "react";
import { Navigate, NavLink } from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import projects from "../../data/projects";
import Avatar from "react-avatar";
import {
  HiOutlineLockClosed,
  HiOutlinePencil,
  HiOutlinePencilAlt,
} from "react-icons/hi";

const ProjectLayout = () => {
  const { id } = useParams();

  const project = projects.find((p) => p._id === id);

  if (!project) {
    return <Navigate to="/404" replace={true} />;
  }

  return (
    <div className="project-detail">
      <header className="top w-full bg-white px-8 pt-4">
        <div className="info flex items-start mb-8">
          <div className="icon mr-4">
            {project.icon ? (
              <Avatar
                src={project.icon}
                alt="project icon"
                className="rounded"
                size="48"
                textSizeRatio={1.75}
              />
            ) : (
              <Avatar
                name={project.name}
                className="rounded"
                size="48"
                textSizeRatio={1.75}
              />
            )}
          </div>
          <div className="right mr-4">
            <h3 className="text-xl font-medium mb-0.5">{project.name}</h3>
            <p className="flex items-center text-sm">
              <span className="mr-1">
                <HiOutlineLockClosed />
              </span>
              <span>Private</span>
            </p>
          </div>
          <button className="bg-violet-200 px-1 py-0.5 rounded text-sm">
            <HiOutlinePencil size={18} />
          </button>
        </div>

        <ul className="flex pb-2">
          <li className="w-18">
            <NavLink
              to={`/p/${id}/boards`}
              className={({ isActive }) => {
                return `text-base mr-6 font-medium text-gray-500 ${
                  isActive
                    ? "border-b-4 pb-2 primary-color-text primary-color-border"
                    : ""
                }`;
              }}
            >
              Boards
            </NavLink>
          </li>
          <li className="w-18">
            <NavLink
              to={`/p/${id}/members`}
              className={({ isActive }) => {
                return `text-base mr-6 font-medium text-gray-500 ${
                  isActive
                    ? "border-b-4 pb-2 primary-color-text primary-color-border"
                    : ""
                }`;
              }}
            >
              Members
            </NavLink>
          </li>
          <li className="w-18">
            <NavLink
              to={`/p/${id}/settings`}
              className={({ isActive }) => {
                return `text-base mr-6 font-medium text-gray-500 ${
                  isActive
                    ? "border-b-4 pb-2 primary-color-text primary-color-border"
                    : ""
                }`;
              }}
            >
              Settings
            </NavLink>
          </li>
        </ul>
      </header>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProjectLayout;
