import { AxiosError } from "axios";
import React, { useCallback, useState } from "react";
import { HiOutlineLockClosed, HiOutlineStar } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { addToast } from "../../redux/features/toastSlice";
import { BoardObj, SpaceObj } from "../../types";
import { BOARD_VISIBILITY_TYPES, ERROR } from "../../types/constants";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

interface Props {
  board: BoardObj;
  spaceId: string;
}

const Board = ({ board, spaceId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [isIn, setIsIn] = useState(false);

  const addToFavorite = useCallback((boardId: string) => {
    axiosInstance
      .post(`/favorites`, {
        boardId: boardId,
      })
      .then((response) => {
        const { data } = response.data;

        if (response.status === 201) {
          if (queryClient.getQueryData(["getBoard", boardId])) {
            queryClient.setQueryData(
              ["getBoard", boardId],
              (oldData: any) => {
                return {
                  ...oldData,
                  isFavorite: true,
                  favoriteId: data._id,
                };
              }
            );
          }

          // edit this board cache inside space boards
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

  const removeFavorite = useCallback((favId: string, boardId: string) => {
    axiosInstance
      .delete(`/favorites/${favId}`)
      .then((response) => {
        if (queryClient.getQueryData(["getBoard", boardId])) {
          queryClient.setQueryData(["getBoard", boardId], (oldData: any) => {
            return {
              ...oldData,
              isFavorite: false,
              favoriteId: null,
            };
          });
        }

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
  }, []);

  return (
    <Link
      onMouseEnter={() => setIsIn(true)}
      onMouseLeave={() => setIsIn(false)}
      to={`/b/${board._id}`}
      className="board relative h-28 rounded cursor-pointer text-white font-semibold  hover:bg-gradient-to-r from-slate-500 to-slate-500 bg-blend-darken"
      style={{
        background: board.bgImg ? `url(${board.bgImg})` : board.color,
        backgroundRepeat: "no-repeat",
        boxShadow: `inset 0 0 0 2000px rgba(0, 0, 0, 0.22)`,
        backgroundPosition: "50%",
        backgroundOrigin: "border-box",
        backgroundSize: "cover",
        width: 230,
        maxWidth: 230,
        backgroundBlendMode: "overlay",
      }}
    >
      {isIn && (
        <div className="overlay absolute rounded top-0 right-0 bottom-0 left-0 bg-slate-900 opacity-20"></div>
      )}
      <div className="details absolute top-0 right-0 bottom-0 left-0 flex px-3 py-2">
        {board.name}
      </div>

      <div className="absolute bottom-2 left-2">
        {board.visibility === BOARD_VISIBILITY_TYPES.PRIVATE && (
          <UtilityBtn
            iconSize={14}
            uniqueId="private-board-component"
            Icon={HiOutlineLockClosed}
            label="Private Board"
            tooltipPosition="bottom"
          />
        )}
      </div>

      {isIn && (
        <div className="absolute bottom-2 right-2">
          {board.isFavorite ? (
            <UtilityBtn
              Icon={HiOutlineStar}
              label="Unfavorite"
              uniqueId="board-component-unfavorite"
              iconFillColor="#fbbf24"
              iconColor="#fbbf24"
              onClick={(e: any) => {
                e.preventDefault();
                removeFavorite(board.favoriteId!, board._id);
              }}
            />
          ) : (
            <UtilityBtn
              Icon={HiOutlineStar}
              label="Favorite"
              uniqueId="board-component-favorite"
              onClick={(e: any) => {
                e.preventDefault();
                addToFavorite(board._id);
              }}
            />
          )}
        </div>
      )}
    </Link>
  );
};

export default Board;
