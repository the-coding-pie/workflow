import React from "react";
import { Link } from "react-router-dom";
import { BoardObj } from "../types";

interface Props {
  board: BoardObj;
  projectId: string;
}

const Board = ({ board, projectId }: Props) => {
  return (
    <Link
      to={`/p/${projectId}/b/${board._id}`}
      className="board h-24 rounded cursor-pointer"
      style={{
        background: board.img ? `url(${board.img})` : board.color,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "50%",
        backgroundOrigin: "border-box",
        backgroundSize: "cover",
      }}
    >
      {board.name}
    </Link>
  );
};

export default Board;
