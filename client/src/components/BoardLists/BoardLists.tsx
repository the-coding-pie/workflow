import React, { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { HiOutlinePlus } from "react-icons/hi";
import cards from "../../data/cards";
import lists from "../../data/lists";
import { BOARD_ROLES } from "../../types/constants";
import List from "./List";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const BoardLists = ({ myRole }: Props) => {
  const [data, setData] = useState({
    lists: lists,
    cards: cards,
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    console.log(source);
    console.log(destination);
    console.log(draggableId);

    if (!destination) {
      return;
    }

    // no change
    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    ) {
      return;
    }

    // same list
    if (source.droppableId === destination.droppableId) {
      const newCards = data.cards.map((c) => {
        if (c._id === draggableId) {
          if (source.index > destination.index) {
            // dragging up
            c.pos = Math.floor(Math.random() * destination.index) - 5;
          } else {
            // dragging down
            // so increase pos of dragging card
            c.pos = Math.floor(Math.random() * destination.index) + 5;
          }
          return c;
        }

        return c;
      });

      setData((prevVale) => {
        return {
          ...prevVale,
          cards: newCards,
        };
      });
    }

    // different list
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        id="board-lists"
        className="board-lists w-full mt-4 flex items-start overflow-x-auto overflow-y-hidden gap-x-4 pr-4"
        style={{
          zIndex: "5",
          height: "calc(100vh - 8.7rem)",
        }}
      >
        {data.lists.map((l) => {
          const cards = data.cards
            .filter((c) => c.listId === l._id)
            .sort((a, b) => a.pos - b.pos);

          return <List key={l._id} list={l} myRole={myRole} cards={cards} />;
        })}

        <button
          className="add-a-list bg-gray-100 flex items-center px-2 py-3 rounded hover:bg-gray-200"
          style={{
            fontSize: "0.9rem",
            minWidth: "18rem",
          }}
        >
          <HiOutlinePlus className="mr-1 text-gray-800" size={18} />
          <span> Add a List</span>
        </button>
      </div>
    </DragDropContext>
  );
};

export default BoardLists;
