import React, { useState } from "react";
import { HiOutlineLockClosed, HiOutlineStar } from "react-icons/hi";
import { Link } from "react-router-dom";
import { BoardObj } from "../../types";
import { BOARD_VISIBILITY_TYPES } from "../../types/constants";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

interface Props {
  board: BoardObj;
}

const Board = ({ board }: Props) => {
  const [isIn, setIsIn] = useState(false);

  return (
    <Link
      onMouseEnter={() => setIsIn(true)}
      onMouseLeave={() => setIsIn(false)}
      to={`/b/${board._id}`}
      className="board relative h-28 rounded cursor-pointer text-white font-semibold  hover:bg-gradient-to-r from-slate-500 to-slate-500 bg-blend-darken"
      style={{
        background: board.bgImg ? `url(${board.bgImg})` : board.color,
        backgroundRepeat: "no-repeat",
        boxShadow:`inset 0 0 0 2000px rgba(0, 0, 0, 0.22)`,
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
              }}
            />
          ) : (
            <UtilityBtn
              Icon={HiOutlineStar}
              label="Favorite"
            uniqueId="board-component-favorite"
              onClick={(e: any) => {
                e.preventDefault();
              }}
            />
          )}
        </div>
      )}
    </Link>
  );
};

export default Board;
