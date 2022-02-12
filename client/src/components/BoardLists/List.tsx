import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { HiOutlinePlus } from "react-icons/hi";
import { CardObj, ListObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";
import AddACard from "./AddACard";
import Card from "./Card";
import CardDummy from "./CardDummy";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  list: ListObj;
  cards: CardObj[];
  index: number;
  boardId: string;
}

const List = ({ myRole, index, list, boardId, cards }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="list p-2 overflow-hidden rounded mr-4 flex flex-col"
          style={{
            ...provided.draggableProps.style,
            background: "#EBECF0",
            flex: "0 0 18rem",
            maxHeight: "calc(100vh - 10.2rem)",
          }}
        >
          <header {...provided.dragHandleProps} className="list__header mb-1">
            <h3 className="list-title font-semibold text-base px-2">
              {list.name}
            </h3>
          </header>

          <Droppable
            renderClone={(provided, snapshot, rubric) => {
              const card = cards.find((c) => c._id === rubric.draggableId)!;

              return (
                <CardDummy
                  card={card}
                  provided={provided}
                  snapshot={snapshot}
                />
              );
            }}
            droppableId={list._id}
            type="CARD"
          >
            {(provided, snapshot) => (
              <div
                className={`flex-1 flex flex-col overflow-hidden`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <ul
                  id="list-items"
                  className="list-items flex-1 w-full flex flex-col overflow-auto overflow-x-hidden pt-1 pr-1"
                  style={{
                    minHeight: "1px",
                  }}
                >
                  {cards.map((c, index) => (
                    <Card key={c._id} index={index} card={c} myRole={myRole} />
                  ))}

                  {provided.placeholder}

                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) &&
                    isOpen && (
                      <AddACard
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        queryKey={["getLists", boardId]}
                        boardId={boardId}
                        listId={list._id}
                        prevPos={
                          cards.length > 0 ? cards[cards.length - 1].pos : null
                        }
                      />
                    )}
                </ul>
              </div>
            )}
          </Droppable>

          {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && !isOpen && (
            <button
              className="p-2 hover:bg-gray-300 rounded text-gray-700 hover:text-gray-900 w-full flex items-center"
              onClick={() => setIsOpen(true)}
            >
              <HiOutlinePlus className="mr-1" size={18} />
              <span>Add a card</span>
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default List;
