import React, { useState } from "react";
import { BoardObj, FavoriteObj } from "../../../types";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import { useDispatch } from "react-redux";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";

interface Props {
  item: FavoriteObj;
}

const FavoriteItemBoard = ({ item }: Props) => {
  const dispatch = useDispatch();
  const [showIcons, setShowIcons] = useState(false);

  const [isCurrentBoard, setIsCurrentBoard] = useState(false);

  return (
    <li className="fav-board-item">
      <NavLink
        end
        onClick={(e) => {
          dispatch(setCurrentActiveMenu(1));
          dispatch(setCurrentActiveSpace(item.spaceId!));
        }}
        to={`/b/${item._id}`}
        className={({ isActive }) => {
          setIsCurrentBoard(isActive);

          return `flex items-center justify-between px-3 pl-4 py-2 cursor-pointer relative  ${
            isActive ? "bg-primary_light" : "hover:bg-secondary"
          }`;
        }}
        onMouseEnter={() => setShowIcons(true)}
        onMouseLeave={() => setShowIcons(false)}
      >
        {isCurrentBoard && (
          <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-xl rounded-br-xl"></span>
        )}
        <div className="left flex items-center">
          <div
            className={`color mr-2 w-2 h-2 rounded-full`}
            style={{
              background: item.color,
            }}
          ></div>
          <span>{item.name}</span>
        </div>
        {showIcons && (
          <div className="right text-gray-600 flex items-center">
            <button data-tip="Board settings" className="mr-1">
              <HiOutlineDotsHorizontal size={16} />
            </button>
            <CustomReactToolTip />
          </div>
        )}
      </NavLink>
    </li>
  );
};

export default FavoriteItemBoard;
