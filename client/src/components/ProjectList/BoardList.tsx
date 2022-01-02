import React from "react";
import { BoardObj } from "../../types";
import BoardItem from "./BoardItem";

interface Props {
  projectId: string;
  boards: BoardObj[];
}

const BoardList = ({ boards, projectId }: Props) => {
  return (
    <ul className="board-list text-sm">
      {boards.length > 0 ? (
        boards.map((b) => (
          <BoardItem projectId={projectId} key={b._id} board={b} />
        ))
      ) : (
        <li className="pl-8 py-2">
          Create a{" "}
          <button className="underline text-violet-500 decoration-dashed outline-violet-500 underline-offset-4">
            Board
          </button>{" "}
        </li>
      )}
    </ul>
  );
};

export default BoardList;
