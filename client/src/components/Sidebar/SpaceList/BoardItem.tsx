import React, { useState } from "react";
import { BoardObj } from "../../../types";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import { RootState } from "../../../redux/app";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";

interface Props {
  board: BoardObj;
}

const BoardItem = ({ board }: Props) => {
  const dispatch = useDispatch();
  const [showIcons, setShowIcons] = useState(false);

  const [isCurrentBoard, setIsCurrentBoard] = useState(false);

  useEffect(() => {
    if (isCurrentBoard) {
      dispatch(setCurrentActiveMenu(1));
      dispatch(setCurrentActiveSpace(board.spaceId));
    }
  }, [isCurrentBoard]);

  return (
    <li className="board-item">
      <NavLink
        end
        to={`/b/${board._id}`}
        className={({ isActive }) => {
          setIsCurrentBoard(isActive);

          return `flex items-center justify-between pl-8 pr-4 py-1 cursor-pointer relative  ${
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
              background: board.color,
            }}
          ></div>
          <span>{board.name}</span>
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

export default BoardItem;
