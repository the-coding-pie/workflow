import React from "react";

interface Props {
  description: string;
  spaceId: string;
  boardId: string;
  cardId: string;
}

const CardDescription = ({ description, spaceId, boardId, cardId }: Props) => {
  return <div>CardDescription</div>;
};

export default CardDescription;
