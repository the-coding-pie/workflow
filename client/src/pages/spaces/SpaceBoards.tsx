import React from "react";
import { useParams } from "react-router-dom";
import Board from "../../components/Board/Board";
import spaces from "../../data/spaces";

const SpaceBoards = () => {
  const { id } = useParams();

  const space = spaces.find((s) => s._id === id);

  return (
    <div className="space-boards px-8 py-6">
      <div className="mt-6 flex items-center justify-start flex-wrap gap-x-6 gap-y-6">
        {space?.boards &&
          space?.boards.length > 0 &&
          space?.boards.map((b) => <Board key={b._id} board={b} />)}
      </div>
    </div>
  );
};

export default SpaceBoards;
