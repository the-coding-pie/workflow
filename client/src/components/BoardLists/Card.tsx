import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { CardObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  card: CardObj;
}

const Card = ({ myRole, card }: Props) => {
  return (
    <Draggable draggableId={card._id} index={card.pos}>
      {(provided, snapshot) => (
        <li
         style={{
           zIndex: "200"
         }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white mb-2 rounded p-2 shadow hover:bg-slate-100 cursor-pointer font-normal text-gray-900"
        >
          {card.name}
        </li>
      )}
    </Draggable>
  );
};

export default Card;
