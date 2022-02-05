import React from "react";
import {
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { HiOutlinePlus } from "react-icons/hi";
import { CardObj, ListObj } from "../../types";
import CardDummy from "./CardDummy";

interface Props {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  list: ListObj;
  cards: CardObj[];
}

const ListDummy = ({ provided, snapshot, list, cards }: Props) => {
  return (
    <div
      {...provided.draggableProps}
      ref={provided.innerRef}
      className="list p-2 overflow-hidden rounded flex flex-col text-sm"
      style={{
        ...provided.draggableProps.style,
        background: "#EBECF0",
        flex: "0 0 18rem",
        maxHeight: "calc(100vh - 10.2rem)",
      }}
    >
      <header {...provided.dragHandleProps} className="list__header mb-1">
        <h3 className="list-title font-semibold text-base px-2">{list.name}</h3>
      </header>

      <div className={`flex-1 flex flex-col overflow-hidden`}>
        <ul
          id="list-items"
          className="list-items flex-1 w-full flex flex-col overflow-auto overflow-x-hidden pr-1"
          style={{
            minHeight: "1px",
          }}
        >
          {cards.map((c, index) => (
            <CardDummy key={c._id} card={c} />
          ))}
        </ul>
      </div>

      <button className="w-full cursor-pointer flex items-center px-2 py-1.5 hover:bg-gray-300 rounded text-gray-700 hover:text-gray-900">
        <HiOutlinePlus className="mr-1" size={18} />
        <span>Add a card</span>
      </button>
    </div>
  );
};

export default ListDummy;
