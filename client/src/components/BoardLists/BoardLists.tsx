import { LexoRank } from "lexorank";
import React, { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { HiOutlinePlus } from "react-icons/hi";
import cards from "../../data/cards";
import lists from "../../data/lists";
import { CardObj, ListObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";
import { Lexorank } from "../../utils/lexorank";
import List from "./List";
import ListDummy from "./ListDummy";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const BoardLists = ({ myRole }: Props) => {
  // const lexoRank = new Lexorank();
  const lexoRank = LexoRank.middle()

  console.log(lexoRank)

  const [data, setData] = useState({
    lists: lists,
    cards: cards,
  });

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

    const lexorank = new Lexorank();

    const lists = data.lists.sort((a, b) => {
      if (a.pos < b.pos) {
        return -1;
      }

      if (a.pos > b.pos) {
        return 1;
      }

      return 0;
    });

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

      // list dragging
      // they are dragging to right
      if (sourceList.pos < destinationList.pos) {
        // if they are dragging it to the right most end
        if (!destinationNextList) {
          const [newPos, ok] = lexorank.insert(destinationList.pos, "");

          newLists = lists.map((l) => {
            if (l._id === draggableId) {
              return {
                ...l,
                pos: newPos,
              };
            }

            return l;
          });
        } else {
          // right drag (middle)
          const [newPos, ok] = lexorank.insert(
            destinationList.pos,
            destinationNextList.pos
          );

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
        // left most
        if (!destinationPrevList) {
          const [newPos, ok] = lexorank.insert("", destinationList.pos);

          newLists = lists.map((l) => {
            if (l._id === draggableId) {
              return {
                ...l,
                pos: newPos,
              };
            }

            return l;
          });
        } else {
          // left drag (middle)
          const [newPos, ok] = lexorank.insert(
            destinationPrevList.pos,
            destinationList.pos
          );

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

    // cards
    // card dragging
    let newCards: CardObj[] = [];

    const cards = data.cards;
    const sourceListCards = data.cards
      .filter((c) => c.listId === source.droppableId)
      .sort((a, b) => {
        if (a.pos < b.pos) {
          return -1;
        }

        if (a.pos > b.pos) {
          return 1;
        }

        return 0;
      });
    const destinationListCards = data.cards
      .filter((c) => c.listId === destination.droppableId)
      .sort((a, b) => {
        if (a.pos < b.pos) {
          return -1;
        }

        if (a.pos > b.pos) {
          return 1;
        }

        return 0;
      });

    const destinationTopCard = destinationListCards[destination.index - 1];
    const destinationBottomCard = destinationListCards[destination.index + 1];
    const sourceCard = sourceListCards[source.index];
    const destinationCard = destinationListCards[destination.index];

    // same list
    if (source.droppableId === destination.droppableId) {
      if (source.index > destination.index) {
        // dragging up
        // if they are dragging to the top most
        if (!destinationTopCard) {
          const [newPos, ok] = lexorank.insert("", destinationCard.pos);

          newCards = cards.map((c) => {
            if (c._id === draggableId) {
              return {
                ...c,
                pos: newPos,
              };
            }

            return c;
          });
        } else {
          const [newPos, ok] = lexorank.insert(
            destinationTopCard.pos,
            destinationCard.pos
          );

          newCards = cards.map((c) => {
            if (c._id === draggableId) {
              return {
                ...c,
                pos: newPos,
              };
            }

            return c;
          });
        }
      } else {
        // dragging down
        // dragging to the bottom end
        if (!destinationBottomCard) {
          const [newPos, ok] = lexorank.insert(destinationCard.pos, "");

          newCards = cards.map((c) => {
            if (c._id === draggableId) {
              return {
                ...c,
                pos: newPos,
              };
            }

            return c;
          });
        } else {
          const [newPos, ok] = lexorank.insert(
            destinationCard.pos,
            destinationBottomCard.pos
          );

          newCards = cards.map((c) => {
            if (c._id === draggableId) {
              return {
                ...c,
                pos: newPos,
              };
            }

            return c;
          });
        }
      }

      setData((prevVale) => {
        return {
          ...prevVale,
          cards: newCards,
        };
      });

      return;
    }

    // different list
    if (destinationListCards.length === 0) {
      // no card exists
      newCards = cards.map((c) => {
        if (c._id === draggableId) {
          return {
            ...c,
            pos: "a",
            listId: destination.droppableId,
          };
        }

        return c;
      });
    } else if (destinationListCards.length === 1) {
      // only one card exists
      // if destination card exists, then we are trying to put the card in 0th pos, so newPos should be < destinationCard.pos
      if (destinationCard) {
        const [newPos, ok] = lexorank.insert("", destinationCard.pos);

        newCards = cards.map((c) => {
          if (c._id === draggableId) {
            return {
              ...c,
              pos: newPos,
              listId: destination.droppableId,
            };
          }

          return c;
        });
      } else {
        const [newPos, ok] = lexorank.insert(destinationTopCard.pos, "");

        newCards = cards.map((c) => {
          if (c._id === draggableId) {
            return {
              ...c,
              pos: newPos,
              listId: destination.droppableId,
            };
          }

          return c;
        });
      }
    } else {
      // now there are many cards,
      // possibilities => very top, very bottom, or middle
      // very top
      if (destination.index === 0) {
        const [newPos, ok] = lexorank.insert("", destinationCard.pos);

        newCards = cards.map((c) => {
          if (c._id === draggableId) {
            return {
              ...c,
              pos: newPos,
              listId: destination.droppableId,
            };
          }

          return c;
        });
      } else if (destination.index === destinationListCards.length) {
        // very bottom
        const [newPos, ok] = lexorank.insert(destinationTopCard.pos, "");

        newCards = cards.map((c) => {
          if (c._id === draggableId) {
            return {
              ...c,
              pos: newPos,
              listId: destination.droppableId,
            };
          }

          return c;
        });
      } else {
        // middle
        const [newPos, ok] = lexorank.insert(
          destinationTopCard.pos,
          destinationCard.pos
        );

        newCards = cards.map((c) => {
          if (c._id === draggableId) {
            return {
              ...c,
              pos: newPos,
              listId: destination.droppableId,
            };
          }

          return c;
        });
      }
    }

    setData((prevVale) => {
      return {
        ...prevVale,
        cards: newCards,
      };
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable
        renderClone={(provided, snapshot, rubric) => {
          const list = data.lists.find((l) => l._id === rubric.draggableId)!;
          const cards = data.cards
            .filter((c) => c.listId === rubric.draggableId)
            .sort((a, b) => {
              if (a.pos < b.pos) {
                return -1;
              }

              if (a.pos > b.pos) {
                return 1;
              }

              return 0;
            });

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
              .sort((a, b) => {
                if (a.pos < b.pos) {
                  return -1;
                }

                if (a.pos > b.pos) {
                  return 1;
                }

                return 0;
              })
              .map((l, index) => {
                const cards = data.cards
                  .filter((c) => c.listId === l._id)
                  .sort((a, b) => {
                    if (a.pos < b.pos) {
                      return -1;
                    }

                    if (a.pos > b.pos) {
                      return 1;
                    }

                    return 0;
                  });

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
