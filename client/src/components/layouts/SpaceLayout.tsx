import React from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import spaces from "../../data/spaces";
import Avatar from "react-avatar";
import {
  HiInformationCircle,
  HiOutlineInformationCircle,
  HiOutlineLockClosed,
  HiOutlinePencil,
  HiOutlineStar,
} from "react-icons/hi";
import { ERROR, SPACE_ROLES } from "../../types/constants";
import axiosInstance from "../../axiosInstance";
import { useQuery } from "react-query";
import { SpaceInfoObj } from "../../types";
import { useDispatch } from "react-redux";
import { addToast } from "../../redux/features/toastSlice";
import Loader from "../Loader/Loader";
import Error from "../Error/Error";
import Icon from "../Icon/Icon";
import UtilityBtn from "../UtilityBtn/UtilityBtn";
import SpaceBoards from "../../pages/spaces/SpaceBoards";
import SpaceMembers from "../../pages/spaces/SpaceMembers";
import SpaceSettings from "../../pages/spaces/SpaceSettings";

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
    getSpaceInfo,
    {
      keepPreviousData: true,
    }
  );

  if (isLoading) {
    return (
      <div className="h-full pb-12 w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // handle each error accordingly & specific to that situation
  if (error) {
    if (error?.response) {
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
    } else if (error?.request) {
      return (
        <Error
          msg={"Oops, something went wrong, Unable to get response back!"}
        />
      );
    } else {
      return <Error msg={`Oops, something went wrong!`} />;
    }
  }

  return (
    <div className="space-detail flex flex-col h-full">
      {space && (
        <>
          {" "}
          <header className="top w-full bg-white px-8 pt-4">
            <div className="info flex items-start mb-8">
              <div className="icon mr-4">
                {space.icon ? (
                  <Icon alt={space.name} src={space.icon} size={48} />
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
                  {space.description || (
                    <span className="text-slate-500">No Description</span>
                  )}
                </p>
              </div>
              {space.isFavorite ? (
                <UtilityBtn
                  Icon={HiOutlineStar}
                  label="Unfavorite"
                  iconFillColor="#fbbf24"
                  iconColor="#fbbf24"
                  uniqueId="space-layout-unfavorite"
                  classes="bg-slate-100 shadow px-1 py-0.5 rounded text-sm"
                />
              ) : (
                <UtilityBtn
                  Icon={HiOutlineStar}
                  uniqueId="space-layout-favorite"
                  label="Favorite"
                  classes="bg-slate-100 shadow px-1 py-0.5 rounded text-sm"
                />
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
          <div className="content flex-1">
            <Routes>
              <Route index element={<Navigate to="boards" replace={true} />} />
              <Route path="boards" element={<SpaceBoards />} />
              <Route
                path="members"
                element={<SpaceMembers spaceId={space._id} myRole={space.role} />}
              />
              <Route
                path="settings"
                element={
                  <SpaceSettings spaceId={space._id} myRole={space.role} />
                }
              />

              <Route path="*" element={<Navigate to="/404" replace={true} />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
};

export default SpaceLayout;
