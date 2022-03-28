import React, { useCallback, useRef, useState } from "react";
import { BoardObj, SpaceObj } from "../../../types";
import {
  HiOutlineCog,
  HiOutlineDotsHorizontal,
  HiOutlineLockClosed,
  HiOutlinePencil,
  HiOutlineShare,
  HiOutlineStar,
  HiOutlineTrash,
} from "react-icons/hi";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";
import Options from "../../Options/Options";
import OptionsItem from "../../Options/OptionsItem";
import {
  BOARD_ROLES,
  BOARD_VISIBILITY_TYPES,
  CONFIRM_DELETE_BOARD_MODAL,
  ERROR,
} from "../../../types/constants";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import OptionsHR from "../../Options/OptionsHR";
import { AxiosError } from "axios";
import { useQueryClient } from "react-query";
import axiosInstance from "../../../axiosInstance";
import { addToast } from "../../../redux/features/toastSlice";
import UtilityBtn from "../../UtilityBtn/UtilityBtn";
import { showModal } from "../../../redux/features/modalSlice";

interface Props {
  board: BoardObj;
  setShowPlusIcon: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBoardOptions: React.Dispatch<React.SetStateAction<boolean>>;
}

const BoardItem = ({ board, setShowPlusIcon, setShowBoardOptions }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [showIcon, setShowIcon] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });

  const [isCurrentBoard, setIsCurrentBoard] = useState(false);

  useEffect(() => {
    if (isCurrentBoard) {
      dispatch(setCurrentActiveMenu(1));
      dispatch(setCurrentActiveSpace(board.spaceId!));
    }
  }, [isCurrentBoard]);

  useEffect(() => {
    setShowBoardOptions(showOptions);

    if (showOptions === false) {
      setShowIcon(false);
    }
  }, [showOptions]);

  const optionsBtnRef = useRef<any>(null);

  const addToFavorite = useCallback(
    (boardId: string) => {
      axiosInstance
        .post(`/favorites`, {
          boardId: boardId,
        })
        .then((response) => {
          setShowOptions(false);

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

            if (queryClient.getQueryData(["getSpaceBoards", board.spaceId!])) {
              queryClient.setQueryData(
                ["getSpaceBoards", board.spaceId!],
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

            if (queryClient.getQueryData(["getFavorites"])) {
              queryClient.setQueryData(["getFavorites"], (oldData: any) => {
                return [...oldData, data];
              });
            }
          }
        })
        .catch((error: AxiosError) => {
          setShowOptions(false);

          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 404:
                dispatch(addToast({ kind: ERROR, msg: message }));
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
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
    [board]
  );

  const removeFavorite = useCallback(
    (favId: string, boardId: string) => {
      axiosInstance
        .delete(`/favorites/${favId}`)
        .then((response) => {
          setShowOptions(false);

          if (queryClient.getQueryData(["getBoard", boardId])) {
            queryClient.setQueryData(["getBoard", boardId], (oldData: any) => {
              return {
                ...oldData,
                isFavorite: false,
                favoriteId: null,
              };
            });
          }

          if (queryClient.getQueryData(["getSpaceBoards", board.spaceId!])) {
            queryClient.setQueryData(
              ["getSpaceBoards", board.spaceId!],
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
        })
        .catch((error: AxiosError) => {
          setShowOptions(false);

          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 404:
                dispatch(addToast({ kind: ERROR, msg: message }));
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
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
    [board]
  );

  return (
    <li className="board-item">
      <NavLink
        onClick={(e) => {
          // if click is on options btn
          if (
            optionsBtnRef.current &&
            optionsBtnRef.current.contains(e.target)
          ) {
            e.preventDefault();
          }
        }}
        end
        to={`/b/${board._id}`}
        className={({ isActive }) => {
          setIsCurrentBoard(isActive);

          return `flex items-center justify-between pl-8 pr-4 py-1 cursor-pointer relative  ${
            isActive ? "bg-primary_light" : "hover:bg-secondary"
          }`;
        }}
        onMouseOver={() => setShowIcon(true)}
        onMouseEnter={() => setShowIcon(true)}
        onMouseLeave={() => !showOptions && setShowIcon(false)}
      >
        {isCurrentBoard && (
          <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-xl rounded-br-xl"></span>
        )}
        <div className="left flex items-center">
          <div
            className={`color border border-slate-600 mr-2 w-2 h-2 rounded-full`}
            style={{
              background: board.color,
            }}
          ></div>
          <span className="mr-1">
            {board.name.length > 12
              ? board.name.slice(0, 12) + "..."
              : board.name}
          </span>
          {board.visibility === BOARD_VISIBILITY_TYPES.PRIVATE && (
            <UtilityBtn
              iconSize={14}
              Icon={HiOutlineLockClosed}
              uniqueId="private-board-board-item"
              label="Private Board"
              tooltipPosition="top"
            />
          )}
        </div>

        <div className="right text-gray-600 flex items-center">
          <button
            data-for="board-settings-board"
            onClick={({ nativeEvent }) => {
              setLastCoords({
                x: nativeEvent.pageX,
                y: nativeEvent.pageY,
              });
              setShowOptions(true);
              setShowIcon(true);
              setShowPlusIcon(false);
            }}
            ref={optionsBtnRef}
            data-tip="Board settings"
            className={`mr-1 ${showIcon ? "block" : "hidden"}`}
          >
            <HiOutlineDotsHorizontal size={16} />
          </button>
          <CustomReactToolTip id="board-settings-board" />
        </div>
      </NavLink>

      <Options
        show={showOptions}
        setShow={setShowOptions}
        x={lastCoords.x}
        y={lastCoords.y}
      >
        {board.role === BOARD_ROLES.OBSERVER ? (
          <>
            {board.isFavorite ? (
              <OptionsItem
                key="Unfavorite"
                Icon={HiOutlineStar}
                text="Unfavorite"
                onClick={() => removeFavorite(board.favoriteId!, board._id)}
                iconFillColor="#fbbf24"
                iconColor="#fbbf24"
              />
            ) : (
              <OptionsItem
                key="Favorite"
                Icon={HiOutlineStar}
                text="Favorite"
                onClick={() => addToFavorite(board._id)}
              />
            )}
          </>
        ) : (
          <>
            {board.isFavorite ? (
              <OptionsItem
                key="Unfavorite"
                Icon={HiOutlineStar}
                text="Unfavorite"
                onClick={() => removeFavorite(board.favoriteId!, board._id)}
                iconFillColor="#fbbf24"
                iconColor="#fbbf24"
              />
            ) : (
              <OptionsItem
                key="Favorite"
                Icon={HiOutlineStar}
                text="Favorite"
                onClick={() => addToFavorite(board._id)}
              />
            )}

            {board.role === BOARD_ROLES.ADMIN && (
              <>
                <OptionsItem
                  key="Delete"
                  Icon={HiOutlineTrash}
                  text="Delete"
                  iconColor="#f87171"
                  textColor="#f87171"
                  onClick={() => {
                    setShowOptions(false);

                    dispatch(
                      showModal({
                        modalType: CONFIRM_DELETE_BOARD_MODAL,
                        modalProps: {
                          boardId: board._id,
                          spaceId: board.spaceId,
                        },
                        modalTitle: "Delete board?",
                      })
                    );
                  }}
                />
                <OptionsHR />
              </>
            )}

            <OptionsItem
              key="Settings"
              Icon={HiOutlineCog}
              text="Settings"
              onClick={() => {
                setShowOptions(false);

                navigate(`/b/${board._id}`, {
                  state: { showSettings: true },
                });
              }}
            />
          </>
        )}
      </Options>
    </li>
  );
};

export default BoardItem;
