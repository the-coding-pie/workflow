import React from "react";

interface Props {
  spaceId: string;
  boardId: string;
}

const LabelMenu = ({ spaceId, boardId }: Props) => {
  return <div className="board-labels px-4">Labels</div>;
};

export default LabelMenu;
