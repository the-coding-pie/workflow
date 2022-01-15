import React from "react";
import { Navigate, NavLink } from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import spaces from "../../data/spaces";
import Avatar from "react-avatar";
import { HiOutlineLockClosed, HiOutlinePencil } from "react-icons/hi";

const SpaceLayout = () => {
  const { id } = useParams();

  const space = spaces.find((s) => s._id === id);

  if (!space) {
    return <Navigate to="/404" replace={true} />;
  }

  return (
    <div className="space-detail">
      <header className="top w-full bg-white px-8 pt-4">
        <div className="info flex items-start mb-8">
          <div className="icon mr-4">
            {space.icon ? (
              <Avatar
                src={space.icon}
                alt="space icon"
                className="rounded"
                size="48"
                textSizeRatio={1.75}
              />
            ) : (
              <Avatar
                name={space.name}
                className="rounded"
                size="48"
                textSizeRatio={1.75}
              />
            )}
          </div>
          <div className="right mr-4">
            <h3 className="text-xl font-medium mb-0.5">{space.name}</h3>
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
              to={`/s/${id}/boards`}
              className={({ isActive }) => {
                return `text-base mr-6 font-medium text-gray-500 ${
                  isActive ? "border-b-4 pb-2 text-primary border-primary" : ""
                }`;
              }}
            >
              Boards
            </NavLink>
          </li>
          <li className="w-18">
            <NavLink
              to={`/s/${id}/members`}
              className={({ isActive }) => {
                return `text-base mr-6 font-medium text-gray-500 ${
                  isActive ? "border-b-4 pb-2 text-primary border-primary" : ""
                }`;
              }}
            >
              Members
            </NavLink>
          </li>
          <li className="w-18">
            <NavLink
              to={`/s/${id}/settings`}
              className={({ isActive }) => {
                return `text-base mr-6 font-medium text-gray-500 ${
                  isActive ? "border-b-4 pb-2 text-primary border-primary" : ""
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

export default SpaceLayout;
