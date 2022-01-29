import { AxiosError } from "axios";
import React, { useCallback } from "react";
import { HiOutlineStar } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../axiosInstance";
import Error from "../../../components/Error/Error";
import Loader from "../../../components/Loader/Loader";
import UtilityBtn from "../../../components/UtilityBtn/UtilityBtn";
import { addToast } from "../../../redux/features/toastSlice";
import { Board, BoardObj, SpaceObj } from "../../../types";
import { ERROR } from "../../../types/constants";

const BoardDetail = () => {
  const { id } = useParams();

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const addToFavorite = useCallback((boardId: string, spaceId: string) => {
    axiosInstance
      .post(`/favorites`, {
        boardId: boardId,
      })
      .then((response) => {
        const { data } = response.data;

        if (response.status === 201) {
          // edit this board cache inside space boards
          queryClient.setQueriesData(["getBoard", boardId], (oldData: any) => {
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
          queryClient.setQueriesData(["getBoard", boardId], (oldData: any) => {
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
    const response = await axiosInstance.get(`/boards/${id}`);

    const { data } = response.data;

    return data;
  };

  const {
    data: board,
    isLoading,
    error,
  } = useQuery<Board | undefined, any, Board, string[]>(
    ["getBoard", id!],
    getBoard
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
    <div className="board-page">
      {board && (
        <div
          className="board-wrapper w-screen h-screen overflow-hidden"
          style={{
            background: board.bgImg ? `url(${board.bgImg})` : board.color,
            backgroundRepeat: "no-repeat",
            boxShadow: `inset 0 0 0 2000px rgba(255, 255, 255, 0.3)`,
            backgroundPosition: "100%",
            backgroundOrigin: "border-box",
            backgroundSize: "cover",
            width: "100%",
            maxWidth: "100%",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="board-content w-full h-screen overflow-y-hidden overflow-x-auto">
            <header className="board-header px-5 py-2 flex items-center gap-x-4">
              <div className="board-name font-semibold bg-white shadow rounded p-2">
                {board.name}
              </div>

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
                    classes="bg-slate-100 shadow p-2 rounded text-sm"
                  />
                ) : (
                  <UtilityBtn
                    Icon={HiOutlineStar}
                    uniqueId="board-detail-favorite"
                    label="Favorite"
                    classes="bg-slate-100 shadow p-2 rounded text-sm"
                    onClick={() => addToFavorite(board._id, board.space._id)}
                  />
                )}
              </div>
            </header>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardDetail;
