import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BoardObj } from "../../types";

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
        background: board.img ? `url(${board.img})` : board.color,
        backgroundRepeat: "no-repeat",
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
    </Link>
  );
};

export default Board;
