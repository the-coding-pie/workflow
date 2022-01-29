import React from "react";
import { BoardMemberObj } from "../../types";

interface Props {
  members: BoardMemberObj[];
}

const BoardMembers = ({ members }: Props) => {
  return <div className="board-members"></div>;
};

export default BoardMembers;
