import React from "react";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import spaces from "../../data/spaces";
import Avatar from "react-avatar";
import { HiOutlineLockClosed, HiOutlinePencil } from "react-icons/hi";
import { ERROR, SPACE_ROLES } from "../../types/constants";
import axiosInstance from "../../axiosInstance";
import { useQuery } from "react-query";
import { SpaceInfoObj } from "../../types";
import { useDispatch } from "react-redux";
import { addToast } from "../../redux/features/toastSlice";
import Loader from "../Loader/Loader";
import Error from "../Error/Error";

const SpaceLayout = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const getSpaceInfo = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/spaces/${queryKey[1]}/info`);

    const { data } = response.data;

    return data;
  };

  const {
    data: space,
    isLoading,
    error,
  } = useQuery<SpaceInfoObj | undefined, any, SpaceInfoObj, string[]>(
    ["getSpaceInfo", id!],
    getSpaceInfo
  );

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // handle each error accordingly & specific to that situation
  if (error) {
    if (error.response) {
      const response = error.response;
      const { message } = response.data;

      switch (response.status) {
        case 400:
        case 404:
          dispatch(addToast({ kind: ERROR, msg: message }));
          // redirect them to home page
          return <Navigate to="/" replace={true} />;
        case 500:
          return <Error msg={message} />;
        default:
          return <Error msg={"Oops, something went wrong!"} />;
      }
    } else if (error.request) {
      return <Error msg={"Oops, something went wrong!"} />;
    } else {
      return <Error msg={`Oops, something went wrong!`} />;
    }
  }

  return (
    space && (
      <div className="space-detail">
        <header className="top w-full bg-white px-8 pt-4">
          <div className="info flex items-start mb-8">
            <div className="icon mr-4">
              {space?.icon ? (
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
            {space.role !== SPACE_ROLES.GUEST && (
              <button className="bg-violet-200 px-1 py-0.5 rounded text-sm">
                <HiOutlinePencil size={18} />
              </button>
            )}
          </div>

          <ul className="flex pb-2">
            <li className="w-18">
              <NavLink
                to={`/s/${id}/boards`}
                className={({ isActive }) => {
                  return `text-base mr-6 font-medium text-gray-500 ${
                    isActive
                      ? "border-b-4 pb-2 text-primary border-primary"
                      : ""
                  }`;
                }}
              >
                Boards
              </NavLink>
            </li>
            {space.role === SPACE_ROLES.GUEST ? (
              <>
                <li className="w-18">
                  <div className="text-base mr-6 font-medium text-gray-400 cursor-not-allowed noselect">
                    Members
                  </div>
                </li>
                <li className="w-18">
                  <div className="text-base mr-6 font-medium text-gray-400 cursor-not-allowed noselect">
                    Settings
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="w-18">
                  <NavLink
                    to={`/s/${id}/members`}
                    className={({ isActive }) => {
                      return `text-base mr-6 font-medium text-gray-500 ${
                        isActive
                          ? "border-b-4 pb-2 text-primary border-primary"
                          : ""
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
                        isActive
                          ? "border-b-4 pb-2 text-primary border-primary"
                          : ""
                      }`;
                    }}
                  >
                    Settings
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </div>
    )
  );
};

export default SpaceLayout;
