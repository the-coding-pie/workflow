import React, { useCallback, useEffect, useState } from "react";
import { BoardObj, FavoriteObj, SpaceObj } from "../../../types";
import { HiOutlineDotsHorizontal, HiOutlineStar } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import { useDispatch } from "react-redux";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";
import { useRef } from "react";
import Options from "../../Options/Options";
import OptionsItem from "../../Options/OptionsItem";
import { addToast } from "../../../redux/features/toastSlice";
import { ERROR } from "../../../types/constants";
import { AxiosError } from "axios";
import { useQueryClient } from "react-query";
import axiosInstance from "../../../axiosInstance";

interface Props {
  item: FavoriteObj;
}

const FavoriteItemBoard = ({ item }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [showIcon, setShowIcon] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });

  const [isCurrentBoard, setIsCurrentBoard] = useState(false);

  useEffect(() => {
    setShowOptions(showOptions);

    if (showOptions === false) {
      setShowIcon(false);
    }
  }, [showOptions]);

  const optionsBtnRef = useRef<any>(null);

  const removeFavorite = useCallback((favId: string, boardId: string) => {
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

        if (queryClient.getQueryData(["getSpaceBoards", item.spaceId])) {
          queryClient.setQueryData(
            ["getSpaceBoards", item.spaceId],
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

        queryClient.setQueryData(["getFavorites"], (oldData: any) => {
          return oldData.filter((fav: any) => fav._id.toString() !== favId);
        });

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
  }, []);

  return (
    <li className="fav-board-item">
      <NavLink
        end
        onClick={(e) => {
          // if click is on options btn
          if (
            optionsBtnRef.current &&
            optionsBtnRef.current.contains(e.target)
          ) {
            e.preventDefault();
          } else {
            dispatch(setCurrentActiveMenu(1));
            dispatch(setCurrentActiveSpace(item.spaceId!));
          }
        }}
        to={`/b/${item.resourceId}`}
        className={({ isActive }) => {
          setIsCurrentBoard(isActive);

          return `flex items-center justify-between px-3 pl-4 py-2 cursor-pointer relative  ${
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
            className={`color mr-2 w-2 h-2 rounded-full  border border-slate-600`}
            style={{
              background: item.color,
            }}
          ></div>
          <span>
            {" "}
            {item.name.length > 12 ? item.name.slice(0, 12) + "..." : item.name}
          </span>
        </div>

        <div className="right text-gray-600 flex items-center">
          <button
            data-for="board-settings"
            onClick={({ nativeEvent }) => {
              setLastCoords({
                x: nativeEvent.pageX,
                y: nativeEvent.pageY,
              });
              setShowOptions(true);
              setShowIcon(true);
            }}
            ref={optionsBtnRef}
            data-tip="Board settings"
            className={`mr-1 ${showIcon ? "block" : "hidden"}`}
          >
            <HiOutlineDotsHorizontal size={16} />
          </button>
          <CustomReactToolTip id="board-settings" />
        </div>
      </NavLink>

      <Options
        show={showOptions}
        setShow={setShowOptions}
        x={lastCoords.x}
        y={lastCoords.y}
      >
        <OptionsItem
          key="Unfavorite"
          Icon={HiOutlineStar}
          text="Unfavorite"
          onClick={() => removeFavorite(item._id, item.resourceId)}
          iconFillColor="#fbbf24"
          iconColor="#fbbf24"
        />
      </Options>
    </li>
  );
};

export default FavoriteItemBoard;
