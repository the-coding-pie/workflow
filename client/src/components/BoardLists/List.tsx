import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { HiOutlinePlus } from "react-icons/hi";
import { CardObj, ListObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";
import Card from "./Card";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  list: ListObj;
  cards: CardObj[];
}

const List = ({ myRole, list, cards }: Props) => {
  return (
    <Draggable draggableId={list._id} index={list.pos}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="list first:ml-4 p-2 rounded flex flex-col"
          style={{
            background: "#EBECF0",
            flex: "0 0 18rem",
            maxHeight: "calc(100vh - 10.2rem)",
            minHeight: "200px"
          }}
        >
          <header {...provided.dragHandleProps} className="list__header mb-1">
            <h3 className="list-title font-semibold text-base px-2">
              {list.name}
            </h3>
          </header>

          <Droppable
            // renderClone={(provided, snapshot, rubric) => (
            //   <li
            //     ref={provided.innerRef}
            //     {...provided.draggableProps}
            //     {...provided.dragHandleProps}
            //     className="bg-white mb-2 rounded p-2 shadow hover:bg-slate-100 cursor-pointer font-normal text-gray-900 list-none text-sm"
            //   >
            //     {cards.find((c) => c._id === rubric.source.droppableId)?.name}
            //   </li>
            // )}
            droppableId={list._id}
            type="card"
          >
            {(provided, snapshot) => (
              <div
                className={`flex-1 flex flex-col overflow-hidden`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <ul
                  id="list-items"
                  className="list-items flex-1 w-full flex flex-col overflow-auto overflow-x-hidden pr-1"
                  style={{
                    minHeight: "1px",
                  }}
                >
                  {cards.map((c) => (
                    <Card key={c._id} card={c} myRole={myRole} />
                  ))}

                  {provided.placeholder}
                </ul>
              </div>
            )}
          </Droppable>

          <button className="w-full cursor-pointer flex items-center px-2 py-1.5 hover:bg-gray-300 rounded text-gray-700 hover:text-gray-900 mt-1">
            <HiOutlinePlus className="mr-1" size={18} />
            <span>Add a card</span>
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default List;
