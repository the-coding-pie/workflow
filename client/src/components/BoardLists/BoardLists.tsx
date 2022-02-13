import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { HiOutlinePlus } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { addToast } from "../../redux/features/toastSlice";
import { CardObj, ListObj } from "../../types";
import {
  BOARD_ROLES,
  CARD_POSSIBLE_DRAGS,
  ERROR,
  LIST_POSSIBLE_DRAGS,
} from "../../types/constants";
import { Lexorank } from "../../utils/lexorank";
import ErrorBoardLists from "../ErrorBoardLists/ErrorBoardLists";
import Loader from "../Loader/Loader";
import AddAList from "./AddAList";
import List from "./List";
import ListDummy from "./ListDummy";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  boardId: string;
}

interface ListsAndCards {
  lists: ListObj[];
  cards: CardObj[];
}

const BoardLists = ({ myRole, boardId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const getLists = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/lists?boardId=${queryKey[1]}`);

    const { data } = response.data;

    return data;
  };

  const { data, isLoading, isRefetching, error } = useQuery<
    ListsAndCards | undefined,
    any,
    ListsAndCards,
    string[]
  >(["getLists", boardId], getLists);

  if (isLoading) {
    return (
      <div
        className="h-full w-full items-center justify-center flex overflow-x-auto overflow-y-hidden pr-4 absolute top-0 right-0 bottom-0 left-0"
        style={{
          zIndex: "5",
          height: "calc(100vh - 8.7rem)",
        }}
      >
        <Loader />
      </div>
    );
  }

  // handle each error accordingly & specific to that situation
  if (error) {
    if (error?.response) {
      const response = error.response;
      const { message } = response.data;

      switch (response.status) {
        case 400:
        case 404:
          queryClient.invalidateQueries(["getBoard", boardId]);
          queryClient.invalidateQueries(["getLists", boardId]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);
          queryClient.invalidateQueries(["getSpaceBoards"]);

          dispatch(addToast({ kind: ERROR, msg: message }));
          // redirect them to home page
          return <Navigate to="/" replace={true} />;
        case 500:
          return (
            <ErrorBoardLists
              isRefetching={isRefetching}
              queryKey={["getLists", boardId]}
              msg={message}
            />
          );
        default:
          return (
            <ErrorBoardLists
              isRefetching={isRefetching}
              queryKey={["getLists", boardId]}
              msg={"Oops, something went wrong!"}
            />
          );
      }
    } else if (error?.request) {
      return (
        <ErrorBoardLists
          isRefetching={isRefetching}
          queryKey={["getLists", boardId]}
          msg={"Oops, something went wrong, Unable to get response back!"}
        />
      );
    } else {
      return (
        <ErrorBoardLists
          isRefetching={isRefetching}
          msg={`Oops, something went wrong!`}
          queryKey={["getLists", boardId]}
        />
      );
    }
  }

  const handleDragEnd = (result: DropResult, data: ListsAndCards) => {
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

      let finalPos: string;
      let dir: string;

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
        dir = LIST_POSSIBLE_DRAGS.RIGHT;

        // if they are dragging it to the right most end
        if (!destinationNextList) {
          const [newPos, ok] = lexorank.insert(destinationList.pos, "");
          finalPos = newPos;

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
          finalPos = newPos;

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
        dir = LIST_POSSIBLE_DRAGS.LEFT;

        // left
        // left most
        if (!destinationPrevList) {
          const [newPos, ok] = lexorank.insert("0", destinationList.pos);
          finalPos = newPos;

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
          finalPos = newPos;

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

      console.log("finalPos :", finalPos);
      console.log("dir :", dir);
      // hit endpoint here

      queryClient.setQueryData(["getLists", boardId], (oldData: any) => {
        return {
          ...oldData,
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
      let finalPos: string;
      let dir: string;

      if (source.index > destination.index) {
        dir = CARD_POSSIBLE_DRAGS.UP;

        // dragging up
        // if they are dragging to the top most
        if (!destinationTopCard) {
          const [newPos, ok] = lexorank.insert("0", destinationCard.pos);

          finalPos = newPos;

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

          finalPos = newPos;

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
        dir = CARD_POSSIBLE_DRAGS.DOWN;

        // dragging down
        // dragging to the bottom end
        if (!destinationBottomCard) {
          const [newPos, ok] = lexorank.insert(destinationCard.pos, "");

          finalPos = newPos;

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

          finalPos = newPos;

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

      // make request with dir & finalPos (newPos) & cardId & listId

      console.log("Same list");
      console.log(finalPos, "newPos");
      console.log(draggableId, "cardId");
      console.log(destination.droppableId, "listId");
      console.log(dir, "direction");

      queryClient.setQueryData(["getLists", boardId], (oldData: any) => {
        return {
          ...oldData,
          cards: newCards,
        };
      });

      return;
    }

    let finalPos: string;

    // different list
    if (destinationListCards.length === 0) {
      finalPos = "a";

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
        const [newPos, ok] = lexorank.insert("0", destinationCard.pos);

        finalPos = newPos;

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

        finalPos = newPos;

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
        const [newPos, ok] = lexorank.insert("0", destinationCard.pos);

        finalPos = newPos;

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

        finalPos = newPos;

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

        finalPos = newPos;

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

    // make request with finalPos (newPos) & cardId & listId

    console.log("Different list");
    console.log(finalPos, "newPos");
    console.log(draggableId, "cardId");
    console.log(destination.droppableId, "listId");

    queryClient.setQueryData(["getLists", boardId], (oldData: any) => {
      return {
        ...oldData,
        cards: newCards,
      };
    });
  };

  console.log(data?.cards);

  return data ? (
    <DragDropContext
      onDragEnd={(result: DropResult) => handleDragEnd(result, data)}
    >
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
              myRole={myRole}
              provided={provided}
              snapshot={snapshot}
              list={list}
              boardId={boardId}
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
                    boardId={boardId}
                    key={l._id}
                    index={index}
                    list={l}
                    myRole={myRole}
                    cards={cards}
                  />
                );
              })}

            {provided.placeholder}

            {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && (
              <AddAList
                dataLength={data.lists.length}
                boardId={boardId}
                queryKey={["getLists", boardId]}
                prevPos={
                  data.lists.length > 0
                    ? data.lists[data.lists.length - 1].pos
                    : null
                }
              />
            )}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  ) : (
    <></>
  );
};

export default BoardLists;
