import React, { useCallback } from "react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import Avatar from "react-avatar";
import { HiOutlineStar } from "react-icons/hi";
import { ERROR, SPACE_ROLES } from "../../types/constants";
import axiosInstance from "../../axiosInstance";
import { useQuery, useQueryClient } from "react-query";
import { SpaceInfoObj, SpaceObj } from "../../types";
import { useDispatch } from "react-redux";
import { addToast } from "../../redux/features/toastSlice";
import Loader from "../Loader/Loader";
import Error from "../Error/Error";
import Icon from "../Icon/Icon";
import UtilityBtn from "../UtilityBtn/UtilityBtn";
import SpaceBoards from "../../pages/spaces/SpaceBoards";
import SpaceMembers from "../../pages/spaces/SpaceMembers";
import SpaceSettings from "../../pages/spaces/SpaceSettings";
import { AxiosError } from "axios";

const SpaceLayout = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const addToFavorite = useCallback((spaceId: string) => {
    axiosInstance
      .post(`/favorites`, {
        spaceId: spaceId,
      })
      .then((response) => {
        const { data } = response.data;

        if (response.status === 201) {
          queryClient.setQueryData(
            ["getSpaceInfo", spaceId],
            (oldData: any) => {
              return {
                ...oldData,
                isFavorite: true,
                favoriteId: data._id,
              };
            }
          );

          if (queryClient.getQueryData(["getSpaces"])) {
            queryClient.setQueryData(["getSpaces"], (oldData: any) => {
              return oldData.map((d: SpaceObj) => {
                if (d._id === spaceId) {
                  return {
                    ...d,
                    isFavorite: true,
                    favoriteId: data._id,
                  };
                }

                return d;
              });
            });
          }

          if (queryClient.getQueryData(["getFavorites"])) {
            queryClient.setQueryData(["getFavorites"], (oldData: any) => {
              return [...oldData, data];
            });
          }
        }
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 404:
              dispatch(addToast({ kind: ERROR, msg: message }));
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              // redirect them to home page
              navigate("/", { replace: true });
              break;
            case 400:
            case 500:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }
      });
  }, []);

  const removeFavorite = useCallback((favId: string, spaceId: string) => {
    axiosInstance
      .delete(`/favorites/${favId}`)
      .then((response) => {
        queryClient.setQueryData(["getSpaceInfo", spaceId], (oldData: any) => {
          return {
            ...oldData,
            isFavorite: false,
            favoriteId: null,
          };
        });

        if (queryClient.getQueryData(["getFavorites"])) {
          queryClient.setQueryData(["getFavorites"], (oldData: any) => {
            return oldData.filter((fav: any) => fav._id.toString() !== favId);
          });
        }

        if (queryClient.getQueryData(["getSpaces"])) {
          queryClient.setQueryData(["getSpaces"], (oldData: any) => {
            return oldData.map((d: SpaceObj) => {
              if (d._id === spaceId) {
                return {
                  ...d,
                  isFavorite: false,
                  favoriteId: null,
                };
              }

              return d;
            });
          });
        }
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 404:
              dispatch(addToast({ kind: ERROR, msg: message }));
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              // redirect them to home page
              navigate("/", { replace: true });
              break;
            case 400:
            case 500:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
              break;
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }
      });
  }, []);

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
      <div className="h-full w-full flex items-center justify-center">
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
            <div className="space-container">
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
                    onClick={() => removeFavorite(space.favoriteId!, space._id)}
                    uniqueId="space-layout-unfavorite"
                    classes="bg-slate-100 shadow px-1 py-0.5 rounded text-sm"
                  />
                ) : (
                  <UtilityBtn
                    Icon={HiOutlineStar}
                    uniqueId="space-layout-favorite"
                    label="Favorite"
                    classes="bg-slate-100 shadow px-1 py-0.5 rounded text-sm"
                    onClick={() => addToFavorite(space._id)}
                  />
                )}
              </div>

              <ul className="flex pb-2">
                <li className="w-18">
                  <NavLink
                    to={`/s/${space._id}/boards`}
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
                        to={`/s/${space._id}/members`}
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
                        to={`/s/${space._id}/settings`}
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
            </div>
          </header>
          <div className="content flex-1">
            <Routes>
              <Route index element={<Navigate to="boards" replace={true} />} />
              <Route
                path="boards"
                element={<SpaceBoards spaceId={space._id} />}
              />
              <Route
                path="members"
                element={
                  <SpaceMembers spaceId={space._id} myRole={space.role} />
                }
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
