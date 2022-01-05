import React, { useState } from "react";
import { BoardObj, ProjectObj } from "../../types";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { NavLink } from "react-router-dom";

interface Props {
  board: BoardObj;
}

const BoardItem = ({ board }: Props) => {
  const [showIcons, setShowIcons] = useState(false);

  const [isCurrentBoard, setIsCurrentBoard] = useState(false);

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
            <button className="mr-1">
              <HiOutlineDotsHorizontal size={16} />
            </button>
          </div>
        )}
      </NavLink>
    </li>
  );
};

export default BoardItem;
