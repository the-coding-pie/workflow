import React, { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { HiOutlinePlus } from "react-icons/hi";
import cards from "../../data/cards";
import lists from "../../data/lists";
import { ListObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";
import List from "./List";
import ListDummy from "./ListDummy";

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

  console.log(data.lists);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

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

    const lists = data.lists.sort((a, b) => a.pos - b.pos);

    // they are dragging the list itself
    if (type === "LIST") {
      let newLists: ListObj[] = [];

      const sourceList = lists[source.index];
      const destinationList = lists[destination.index];
      // use only for right side dragging
      const destinationNextList = lists[destination.index + 1];
      // use only for left side dragging
      const sourceNextList = lists[source.index + 1];
      const destinationPrevList = lists[destination.index - 1];

      // they are dragging to right
      if (sourceList.pos < destinationList.pos) {
        // if they are dragging it to the right most end
        if (!destinationNextList) {
          const newPos = destinationList.pos + 65536;
          // add 65536 to the destinationList.pos and make it the sourceList.pos
          newLists = data.lists.map((l) => {
            if (l._id === draggableId) {
              return {
                ...l,
                pos: newPos,
              };
            }

            return l;
          });
        } else {
          const newPos = (destinationList.pos + destinationNextList.pos) / 2;
          // there may be some next list after destination list
          // in that case, take (destinationList.pos + destinationNextList.pos) / 2
          newLists = lists.map((l) => {
            if (l._id === draggableId) {
              return {
                ...l,
                pos: newPos,
              };
            }

            return l;
          });
        }
      } else {
        // left
        // check if it is left most
        if (!destinationPrevList) {
          let newPos = destinationList.pos / 2;

          if (newPos < 0.1) {
            newPos = 16384;

            const positionedList = lists;
            const el = positionedList.splice(source.index, 1);
            positionedList.splice(destination.index, 0, ...el);

            console.log(el);
            console.log(positionedList);

            const positionedList2 = positionedList.map((l, index) => {
              if (l._id === sourceList._id) {
                return {
                  ...l,
                  pos: newPos,
                };
              } else if (l._id === destinationList._id) {
                if (
                  sourceNextList &&
                  sourceNextList.pos > newPos * 2 &&
                  source.index + 1 === 2
                ) {
                  return {
                    ...l,
                    pos: (newPos + sourceNextList.pos) / 2,
                  };
                } else {
                  return {
                    ...l,
                    pos: newPos * 2,
                  };
                }
              }

              return l;
            });
            
            let i = 0;

            newLists = positionedList2.map((l, index) => {
              i += 1;

              if (index > 1) {
                return {
                  ...l,
                  pos:
                    l.pos > positionedList2[index - 1].pos ? l.pos : newPos * i,
                };
              }

              return l;
            });
          } else {
            newLists = lists.map((l) => {
              if (l._id === sourceList._id) {
                return {
                  ...l,
                  pos: newPos,
                };
              }

              return l;
            });
          }
        } else {
          // there is something between
          const newPos = (destinationList.pos + destinationPrevList.pos) / 2;

          newLists = lists.map((l) => {
            if (l._id === draggableId) {
              return {
                ...l,
                pos: newPos,
              };
            }

            return l;
          });
        }
      }

      setData((prevData) => {
        return {
          ...prevData,
          lists: newLists,
        };
      });

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
      <Droppable
        renderClone={(provided, snapshot, rubric) => {
          const list = data.lists.find((l) => l._id === rubric.draggableId)!;
          const cards = data.cards
            .filter((c) => c.listId === rubric.draggableId)
            .sort((a, b) => a.pos - b.pos);

          return (
            <ListDummy
              provided={provided}
              snapshot={snapshot}
              list={list}
              cards={cards}
            />
          );
        }}
        droppableId="board"
        direction="horizontal"
        type="LIST"
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            id="board-lists"
            className="board-lists pl-4 w-full mt-4 flex items-start overflow-x-auto overflow-y-hidden pr-4 absolute top-0 right-0 bottom-0 left-0"
            style={{
              zIndex: "5",
              height: "calc(100vh - 8.7rem)",
            }}
          >
            {data.lists
              .sort((a, b) => a.pos - b.pos)
              .map((l, index) => {
                const cards = data.cards
                  .filter((c) => c.listId === l._id)
                  .sort((a, b) => a.pos - b.pos);

                return (
                  <List
                    key={l._id}
                    index={index}
                    list={l}
                    myRole={myRole}
                    cards={cards}
                  />
                );
              })}

            {provided.placeholder}

            <button
              className={`add-a-list bg-gray-100 flex items-center px-2 py-3 rounded hover:bg-gray-200 ${
                lists.length === 0 ? "ml-5" : "ml-0"
              }`}
              style={{
                fontSize: "0.9rem",
                minWidth: "18rem",
              }}
            >
              <HiOutlinePlus className="mr-1 text-gray-800" size={18} />
              <span> Add a List</span>
            </button>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default BoardLists;
