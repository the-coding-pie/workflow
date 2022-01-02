import React from "react";
import { Navigate, NavLink } from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import projects from "../../data/projects";

const ProjectLayout = () => {
  const { id } = useParams();

  const project = projects.find((p) => p._id === id);

  if (!project) {
    return <Navigate to="/404" replace={true} />;
  }

  return (
    <div className="project-detail">
      <header className="top w-full bg-white px-4 pt-4">
        <div className="info mb-2">
          <h3>{id}</h3>
        </div>

        <ul className="flex">
          <li>
            <NavLink to={`/p/${id}/boards`}>Boards</NavLink>
          </li>
          <li>
            <NavLink to={`/p/${id}/members`}>Members</NavLink>
          </li>
          <li>
            <NavLink to={`/p/${id}/settings`}>Settings</NavLink>
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
