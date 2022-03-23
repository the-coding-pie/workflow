import React from "react";
import {
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
} from "react-beautiful-dnd";
import { HiOutlineDotsHorizontal, HiOutlinePlus } from "react-icons/hi";
import { CardObj, ListObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";
import CardDummy from "./CardDummy";
import ListName from "./ListName";

interface Props {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  list: ListObj;
  spaceId: string;
  boardId: string;
  cards: CardObj[];
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const ListDummy = ({
  provided,
  snapshot,
  list,
  cards,
  myRole,
  boardId,
  spaceId,
}: Props) => {
  return (
    <div
      {...provided.draggableProps}
      ref={provided.innerRef}
      className="list p-2 pt-0 overflow-hidden rounded flex flex-col text-sm cursor-grabbing"
      style={{
        ...provided.draggableProps.style,
        background: "#EBECF0",
        flex: "0 0 18rem",
        maxHeight: "calc(100vh - 10.2rem)",
      }}
    >
      <header
        {...provided.dragHandleProps}
        className="list__header mb-1 flex justify-between items-center pt-3"
      >
        <>
          {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) ? (
            <ListName
              spaceId={spaceId}
              listId={list._id}
              boardId={boardId}
              initialValue={list.name}
            />
          ) : (
            <h3 className="list-title font-semibold text-base h-7 px-2">
              {list.name.length > 34
                ? list.name.slice(0, 34) + "..."
                : list.name}
            </h3>
          )}
        </>
        {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && (
          <button>
            <HiOutlineDotsHorizontal size={16} />
          </button>
        )}
      </header>

      <div className={`flex-1 flex flex-col overflow-hidden`}>
        <ul
          id="list-items"
          className="list-items flex-1 w-full flex flex-col overflow-auto overflow-x-hidden pt-1 pr-1"
          style={{
            minHeight: "1px",
          }}
        >
          {cards.map((c, index) => (
            <CardDummy key={c._id} card={c} />
          ))}
        </ul>
      </div>

      {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && (
        <button className="p-2 hover:bg-gray-300 rounded text-gray-700 hover:text-gray-900 w-full flex items-center">
          <HiOutlinePlus className="mr-1" size={18} />
          <span>Add a card</span>
        </button>
      )}
    </div>
  );
};

export default ListDummy;
