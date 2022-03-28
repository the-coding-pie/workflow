import { AxiosError } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { HiDotsHorizontal, HiOutlineStar } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import ReactTooltip from "react-tooltip";
import axiosInstance from "../../../axiosInstance";
import BoardLists from "../../../components/BoardLists/BoardLists";
import BoardMembers from "../../../components/BoardMembers/BoardMembers";
import BoardMenu from "../../../components/BoardMenu/BoardMenu";
import BoardName from "../../../components/BoardName/BoardName";
import BoardVisibilityDropdown from "../../../components/BoardVisibilityDropdown/BoardVisibilityDropdown";
import CustomReactToolTip from "../../../components/CustomReactToolTip/CustomReactToolTip";
import Error from "../../../components/Error/Error";
import HorizontalSeparator from "../../../components/HorizontalSeparator/HorizontalSeparator";
import InviteBtn from "../../../components/InviteBtn/InviteBtn";
import JoinBtn from "../../../components/JoinBtn/JoinBtn";
import Loader from "../../../components/Loader/Loader";
import UtilityBtn from "../../../components/UtilityBtn/UtilityBtn";
import { RootState } from "../../../redux/app";
import { addToast } from "../../../redux/features/toastSlice";
import { Board, BoardObj, SpaceObj } from "../../../types";
import {
  BOARD_ROLES,
  BOARD_VISIBILITY_TYPES,
  ERROR,
} from "../../../types/constants";

const BoardDetail = () => {
  const { id } = useParams();
  const { state } = useLocation();

  useEffect(() => {
    if (state && state?.showSettings) {
      setShowMenu(true);
    } else {
      setShowMenu(false);
    }
  }, [state, id]);

  useEffect(() => {
    queryClient.invalidateQueries(["getRecentBoards"]);
  }, []);

  const dispatch = useDispatch();

  const { show } = useSelector((state: RootState) => state.sidebar);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showMenu, setShowMenu] = useState(false);

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const boardVisibilityOptions = [
    {
      value: BOARD_VISIBILITY_TYPES.PRIVATE,
      label: BOARD_VISIBILITY_TYPES.PRIVATE,
      sub: "Board members and space admins can see and edit this board",
    },
    {
      value: BOARD_VISIBILITY_TYPES.PUBLIC,
      label: BOARD_VISIBILITY_TYPES.PUBLIC,
      sub: "All members of the space can see and edit this board",
    },
  ];

  const addToFavorite = useCallback((boardId: string, spaceId: string) => {
    axiosInstance
      .post(`/favorites`, {
        boardId: boardId,
      })
      .then((response) => {
        const { data } = response.data;

        if (response.status === 201) {
          // edit this board cache inside space boards
          queryClient.setQueryData(["getBoard", boardId], (oldData: any) => {
            return {
              ...oldData,
              isFavorite: true,
              favoriteId: data._id,
            };
          });

          if (queryClient.getQueryData(["getSpaceBoards", spaceId])) {
            queryClient.setQueryData(
              ["getSpaceBoards", spaceId],
              (oldData: any) => {
                return oldData.map((b: BoardObj) => {
                  if (b._id === boardId) {
                    return {
                      ...b,
                      isFavorite: true,
                      favoriteId: data._id,
                    };
                  }

                  return b;
                });
              }
            );
          }

          if (queryClient.getQueryData(["getSpaces"])) {
            queryClient.setQueryData(["getSpaces"], (oldData: any) => {
              return oldData.map((d: SpaceObj) => {
                return {
                  ...d,
                  boards: d.boards.map((b: BoardObj) => {
                    if (b._id === boardId) {
                      return {
                        ...b,
                        isFavorite: true,
                        favoriteId: data._id,
                      };
                    }

                    return b;
                  }),
                };
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
              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);

              queryClient.invalidateQueries(["getRecentBoards"]);
              queryClient.invalidateQueries(["getAllMyCards"]);

              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
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

  const removeFavorite = useCallback(
    (favId: string, boardId: string, spaceId: string) => {
      axiosInstance
        .delete(`/favorites/${favId}`)
        .then((response) => {
          queryClient.setQueryData(["getBoard", boardId], (oldData: any) => {
            return {
              ...oldData,
              isFavorite: false,
              favoriteId: null,
            };
          });

          if (queryClient.getQueryData(["getSpaceBoards", spaceId])) {
            queryClient.setQueryData(
              ["getSpaceBoards", spaceId],
              (oldData: any) => {
                return oldData.map((b: BoardObj) => {
                  if (b._id === boardId) {
                    return {
                      ...b,
                      isFavorite: false,
                      favoriteId: null,
                    };
                  }

                  return b;
                });
              }
            );
          }

          if (queryClient.getQueryData(["getFavorites"])) {
            queryClient.setQueryData(["getFavorites"], (oldData: any) => {
              return oldData.filter((fav: any) => fav._id.toString() !== favId);
            });
          }

          if (queryClient.getQueryData(["getSpaces"])) {
            queryClient.setQueryData(["getSpaces"], (oldData: any) => {
              return oldData.map((d: SpaceObj) => {
                return {
                  ...d,
                  boards: d.boards.map((b: BoardObj) => {
                    if (b._id === boardId) {
                      return {
                        ...b,
                        isFavorite: false,
                        favoriteId: null,
                      };
                    }

                    return b;
                  }),
                };
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
                queryClient.invalidateQueries(["getSpaceBoards", boardId]);

                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getLists", boardId]);
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
    },
    []
  );

  const getBoard = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/boards/${queryKey[1]}`);

    const { data } = response.data;

    return data;
  };

  const {
    data: board,
    isLoading,
    error,
  } = useQuery<Board | undefined, any, Board, string[]>(
    ["getBoard", id!],
    getBoard,
    {
      staleTime: 0,
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
          queryClient.invalidateQueries(["getBoard", id!]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);
          queryClient.invalidateQueries(["getLists", id!]);
          if (board) {
            queryClient.invalidateQueries(["getSpaceBoards", board.space._id]);
          }
          queryClient.invalidateQueries(["getRecentBoards"]);
          queryClient.invalidateQueries(["getAllMyCards"]);

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
    <div className="board-page h-full">
      {board && (
        <>
          <div
            className="board-background fixed top-0 right-0 bottom-0 left-0"
            style={{
              zIndex: 1,
              backgroundImage: `url(${board.bgImg})`,
              backgroundColor: !board.bgImg ? board.color : "",
              boxShadow: `inset 0 0 0 2000px rgba(150, 150, 150, 0.3)`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "50%",
              backgroundBlendMode: "overlay",
            }}
          ></div>

          <div className="board-content flex flex-col text-sm relative">
            <header
              className={`board-header h-14 w-full px-5 py-2 noselect flex items-center justify-between z-10`}
            >
              <div className="left flex items-center flex-1 gap-x-4">
                {board.role === BOARD_ROLES.ADMIN ? (
                  <BoardName
                    spaceId={board.space._id}
                    boardId={board._id}
                    initialValue={board.name}
                  />
                ) : (
                  <div
                    data-tip="Board name"
                    data-for="board-detail-board-name"
                    className="board-name bg-slate-50 shadow rounded cursor-default px-2 py-1.5 noselect"
                  >
                    {board.name}
                    <CustomReactToolTip
                      place="bottom"
                      id="board-detail-board-name"
                    />
                  </div>
                )}

                <div className="isfavorite">
                  {board.isFavorite ? (
                    <UtilityBtn
                      Icon={HiOutlineStar}
                      label="Unfavorite"
                      iconFillColor="#fbbf24"
                      iconColor="#fbbf24"
                      onClick={() =>
                        removeFavorite(
                          board.favoriteId!,
                          board._id,
                          board.space._id
                        )
                      }
                      uniqueId="board-detail-unfavorite"
                      classes="bg-slate-50 shadow p-2 rounded text-sm"
                    />
                  ) : (
                    <UtilityBtn
                      Icon={HiOutlineStar}
                      uniqueId="board-detail-favorite"
                      label="Favorite"
                      classes="bg-slate-50 shadow p-2 rounded text-sm"
                      onClick={() => addToFavorite(board._id, board.space._id)}
                    />
                  )}
                </div>

                <HorizontalSeparator />

                <div
                  data-tip="Space name"
                  data-for="board-detail-space-name"
                  className="space-name bg-slate-50 rounded px-2 py-1.5 cursor-default noselect"
                >
                  {board.space.name}
                  <CustomReactToolTip
                    place="bottom"
                    id="board-detail-space-name"
                  />
                </div>

                <HorizontalSeparator />

                <div className="board-visibility">
                  {board.role === BOARD_ROLES.ADMIN ? (
                    <BoardVisibilityDropdown
                      spaceId={board.space._id}
                      boardId={board._id}
                      options={boardVisibilityOptions}
                      visibility={board.visibility}
                    />
                  ) : (
                    <div
                      data-tip="Board visibility"
                      data-for="board-detail-board-visibility"
                      className="rounded bg-stone-50 px-2 py-1.5 cursor-default noselect"
                    >
                      {board.visibility}
                      <CustomReactToolTip
                        place="bottom"
                        id="board-detail-board-visibility"
                      />
                    </div>
                  )}
                </div>

                <HorizontalSeparator />

                <BoardMembers
                  boardId={board._id}
                  role={board.role}
                  members={board.members}
                  spaceId={board.space._id}
                />

                {board.role === BOARD_ROLES.ADMIN && (
                  <>
                    <InviteBtn spaceId={board.space._id} boardId={board._id} />
                    {!board.members.find((m: any) => m._id === user!._id) && (
                      <JoinBtn spaceId={board.space._id} boardId={board._id} />
                    )}
                  </>
                )}

                {board.role === BOARD_ROLES.NORMAL && (
                  <>
                    {!board.members.find((m: any) => m._id === user!._id) ? (
                      <JoinBtn spaceId={board.space._id} boardId={board._id} />
                    ) : (
                      <InviteBtn
                        spaceId={board.space._id}
                        boardId={board._id}
                      />
                    )}
                  </>
                )}
              </div>
              <div className="right flex items-center">
                <button
                  onClick={() => setShowMenu((prevValue) => !prevValue)}
                  className="flex items-center bg-slate-50 px-2 py-1.5 rounded"
                >
                  <HiDotsHorizontal className="mr-2" size={14} />
                  Show Menu
                </button>
              </div>

              {showMenu && (
                <BoardMenu
                  description={board.description}
                  spaceId={board.space._id}
                  boardId={board._id}
                  myRole={board.role}
                  setShowMenu={setShowMenu}
                />
              )}
            </header>

            <div className="board-canvas relative flex-1">
              <BoardLists
                myRole={board.role}
                boardId={board._id}
                spaceId={board.space._id}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BoardDetail;
