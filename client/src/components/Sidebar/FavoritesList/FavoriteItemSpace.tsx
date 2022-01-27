import React, { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FavoriteObj, SpaceObj } from "../../../types";
import Avatar from "react-avatar";
import {
  HiOutlineDotsHorizontal,
  HiOutlinePlus,
  HiOutlineStar,
} from "react-icons/hi";
import CustomNavLink from "../../CustomNavLink/CustomNavLink";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import { MdGroup } from "react-icons/md";
import { useEffect } from "react";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";
import Options from "../../Options/Options";
import { ERROR, SPACE_ROLES } from "../../../types/constants";
import OptionsItem from "../../Options/OptionsItem";
import axiosInstance from "../../../axiosInstance";
import { AxiosError } from "axios";
import { addToast } from "../../../redux/features/toastSlice";
import { useQueryClient } from "react-query";
import Icon from "../../Icon/Icon";

interface Props {
  item: FavoriteObj;
}

const FavoriteItemSpace = ({ item }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [showIcon, setShowIcon] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });

  const [isCurrentSpace, setIsCurrentSpace] = useState(false);

  useEffect(() => {
    setShowOptions(showOptions);

    if (showOptions === false) {
      setShowIcon(false);
    }
  }, [showOptions]);

  const optionsBtnRef = useRef<any>(null);

  const removeFavorite = useCallback((favId: string, spaceId: string) => {
    axiosInstance
      .delete(`/favorites/${favId}`)
      .then((response) => {
        setShowOptions(false);

        if (queryClient.getQueryData(["getSpaceInfo", spaceId])) {
          queryClient.setQueryData(
            ["getSpaceInfo", spaceId],
            (oldData: any) => {
              return {
                ...oldData,
                isFavorite: false,
                favoriteId: null,
              };
            }
          );
        }

        queryClient.setQueryData(["getFavorites"], (oldData: any) => {
          return oldData.filter((fav: any) => fav._id.toString() !== favId);
        });

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
    <li
      className="fav-space-item noselect"
      onMouseEnter={() => setShowIcon(true)}
      onMouseOver={() => setShowIcon(true)}
      onMouseLeave={() => !showOptions && setShowIcon(false)}
    >
      <CustomNavLink
        showUnderline={false}
        to={`/s/${item.resourceId}/boards`}
        fn={setIsCurrentSpace}
        list={[
          `/s/${item.resourceId}/boards`,
          `/s/${item.resourceId}/members`,
          `/s/${item.resourceId}/settings`,
        ]}
        onClick={(e: any) => {
          if (
            optionsBtnRef.current &&
            optionsBtnRef.current.contains(e.target)
          ) {
            e.preventDefault();
          } else {
            dispatch(setCurrentActiveMenu(1));
            dispatch(setCurrentActiveSpace(item.resourceId));
          }
        }}
      >
        <div
          className={`space px-3 pl-4 relative py-2 w-full flex items-center justify-between cursor-pointer ${
            isCurrentSpace ? "bg-primary_light" : "hover:bg-secondary"
          }`}
        >
          {isCurrentSpace && (
            <span className="absolute inset-y-0 left-0 w-1 bg-violet-500 rounded-tr-xl rounded-br-xl"></span>
          )}
          <div className="left flex items-center">
            <div className="name flex items-center">
              {item.icon ? (
                <Icon
                  classes="mr-1.5"
                  alt={item.name}
                  src={item.icon}
                  size={18}
                />
              ) : (
                <Avatar
                  name={item.name}
                  className="rounded mr-1.5"
                  size="18"
                  textSizeRatio={1.75}
                />
              )}
              <div>
                {item.name.length > 10 ? (
                  <span>{item.name.slice(0, 10) + "..."}</span>
                ) : (
                  <span>{item.name}</span>
                )}
              </div>
            </div>
          </div>

          <div className="right text-gray-600 flex items-center">
            <button
              onClick={({ nativeEvent }) => {
                setLastCoords({
                  x: nativeEvent.pageX,
                  y: nativeEvent.pageY,
                });
                setShowOptions(true);
                setShowIcon(true);
              }}
              ref={optionsBtnRef}
              data-tip="Space settings"
              data-for="space-settings"
              className={`mr-1 ${showIcon ? "block" : "hidden"}`}
            >
              <HiOutlineDotsHorizontal size={16} />
            </button>
            <CustomReactToolTip id="space-settings" />

            {item.spaceRole === SPACE_ROLES.GUEST && (
              <div className="icon text-slate-600">
                <MdGroup
                  data-for="guest-space"
                  data-tip="Guest Space"
                  size={18}
                />

                <CustomReactToolTip id="guest-space" />
              </div>
            )}
          </div>
        </div>
      </CustomNavLink>

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

export default FavoriteItemSpace;
