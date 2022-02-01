import React from "react";
import { BoardMemberObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";
import BoardMember from "./BoardMember";

interface Props {
  boardId: string;
  spaceId: string;
  role:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  members: BoardMemberObj[];
}

const BoardMembers = ({ boardId, spaceId, role, members }: Props) => {
  const boardAdmins = members.filter((m: any) => m.role === BOARD_ROLES.ADMIN);

  return (
    <div className="board-members flex items-center">
      {members.map((m: BoardMemberObj) => (
        <BoardMember
          key={m._id}
          member={m}
          boardId={boardId}
          boardAdmins={boardAdmins}
          myRole={role}
          spaceId={spaceId}
        />
      ))}
    </div>
  );
};

export default BoardMembers;
