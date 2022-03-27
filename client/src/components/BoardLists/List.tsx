import { AxiosError } from "axios";
import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import {
  HiOutlinePlus,
  HiOutlineDotsHorizontal,
  HiOutlineTrash,
} from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { CardObj, ListObj } from "../../types";
import { BOARD_ROLES, ERROR } from "../../types/constants";
import Options from "../Options/Options";
import OptionsItem from "../Options/OptionsItem";
import AddACard from "./AddACard";
import Card from "./Card";
import CardDummy from "./CardDummy";
import ListName from "./ListName";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  list: ListObj;
  cards: CardObj[];
  index: number;
  boardId: string;
  spaceId: string;
}

const List = ({ myRole, index, list, boardId, spaceId, cards }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });

  const reset = () => {
    setShow(false);
    setLastCoords({ x: 0, y: 0 });
  };

  const deleteList = (_id: string) => {
    axiosInstance
      .delete(`/lists/${_id}`)
      .then((response) => {
        queryClient.setQueryData(["getLists", boardId], (oldData: any) => {
          return {
            ...oldData,
            lists: oldData.lists.filter((l: any) => l._id !== _id),
          };
        });

        reset();
      })
      .catch((error: AxiosError) => {
        reset();

        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);

              queryClient.invalidateQueries(["getRecentBoards"]);
              queryClient.invalidateQueries(["getAllMyCards"]);

              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
              queryClient.invalidateQueries(["getLists", boardId]);
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            case 500:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
              break;
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }
      });
  };

  return (
    <Draggable
      isDragDisabled={![BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole)}
      draggableId={list._id}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="list p-2 pt-0 overflow-hidden rounded mr-4 flex flex-col"
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
                <h3 className="list-title cursor-default font-semibold text-base h-7 px-2">
                  {list.name.length > 34
                    ? list.name.slice(0, 34) + "..."
                    : list.name}
                </h3>
              )}
            </>
            {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && (
              <div className="relative">
                <button
                  onClick={({ nativeEvent }) => {
                    setLastCoords({
                      x: nativeEvent.pageX,
                      y: nativeEvent.pageY,
                    });

                    setShow((prevValue) => !prevValue);
                  }}
                >
                  <HiOutlineDotsHorizontal size={16} />
                </button>

                {show && (
                  <Options
                    show={show}
                    setShow={setShow}
                    x={lastCoords.x - 30}
                    y={lastCoords.y + 20}
                  >
                    <OptionsItem
                      key="DeleteList"
                      Icon={HiOutlineTrash}
                      text="Delete"
                      onClick={() => deleteList(list._id)}
                    />
                  </Options>
                )}
              </div>
            )}
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
                    <Card
                      key={c._id}
                      index={index}
                      card={c}
                      myRole={myRole}
                      spaceId={spaceId}
                      boardId={boardId}
                    />
                  ))}

                  {provided.placeholder}

                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) &&
                    isOpen && (
                      <AddACard
                        spaceId={spaceId}
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
