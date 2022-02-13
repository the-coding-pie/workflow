import React from "react";
import {
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { CardObj } from "../../types";

interface Props {
  provided?: DraggableProvided;
  snapshot?: DraggableStateSnapshot;
  card: CardObj;
}

const CardDummy = ({ card, provided, snapshot }: Props) => {
  
  return provided ? (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="bg-white mb-2 rounded p-2 shadow hover:bg-slate-100 cursor-grabbing font-normal text-gray-900 text-sm list-none"
    >
      {card.name.length > 28 ? card.name.slice(0, 28) + "..." : card.name}
    </li>
  ) : (
    <li className="bg-white mb-2 rounded p-2 shadow hover:bg-slate-100 cursor-pointer font-normal text-gray-900 text-sm list-none">
      {card.name.length > 28 ? card.name.slice(0, 28) + "..." : card.name}
    </li>
  );
};

export default CardDummy;
