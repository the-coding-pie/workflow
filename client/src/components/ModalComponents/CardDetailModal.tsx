import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "../../axiosInstance";
import { CardDetailObj, MemberObj } from "../../types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch } from "react-redux";
import { addToast } from "../../redux/features/toastSlice";
import { BOARD_ROLES, ERROR } from "../../types/constants";
import { Navigate } from "react-router-dom";
import ErrorBoardLists from "../ErrorBoardLists/ErrorBoardLists";
import ErrorCard from "../ErrorCard/ErrorCard";
import CardDetailSkeleton from "../Skeletons/CardDetailSkeleton";
import { hideModal } from "../../redux/features/modalSlice";
import CardDetailName from "../CardDetail/CardDetailName";
import { RiWindowFill } from "react-icons/ri";
import Profile from "../Profile/Profile";
import {
  HiChat,
  HiChatAlt,
  HiMenuAlt2,
  HiOutlineChatAlt,
  HiOutlineClock,
  HiOutlineTag,
  HiOutlineTrash,
  HiOutlineUser,
  HiTag,
} from "react-icons/hi";
import CardDescription from "../CardDetail/CardDescription";
import AddComment from "../CardDetail/AddComment";
import Comment from "../CardDetail/Comment";
import AddMemberBtn from "../CardDetail/AddMemberBtn";
import AddLabelBtn from "../CardDetail/AddLabelBtn";
import DueDateBtn from "../CardDetail/DueDateBtn";
import AddCoverBtn from "../CardDetail/AddCoverBtn";
import { format } from "date-fns";
import { AxiosError } from "axios";
import DueDateStatus from "../CardDetail/DueDateStatus";

interface Props {
  _id: string;
  boardId: string;
  spaceId: string;
}

const CardDetailModal = ({ _id, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [showDescEdit, setShowDescEdit] = useState(false);

  const deleteCard = (_id: string) => {
    axiosInstance
      .delete(`/cards/${_id}`)
      .then((response) => {
        if (queryClient.getQueryData(["getLists", boardId])) {
          queryClient.setQueryData(["getLists", boardId], (oldData: any) => {
            return {
              ...oldData,
              cards: oldData.cards.filter((c: any) => c._id !== _id),
            };
          });
        }

        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.invalidateQueries(["getAllMyCards"]);

        dispatch(hideModal());
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", _id]);
              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", _id]);
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
              dispatch(hideModal());
              queryClient.invalidateQueries(["getCard", _id]);
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

  const toggleIsComplete = (cardId: string) => {
    axiosInstance
      .put(`/cards/${cardId}/isComplete`, {
        headers: {
          ContentType: "application/json",
        },
      })
      .then((response) => {
        const { data } = response.data;

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            isComplete: data.isComplete,
          };
        });

        queryClient.invalidateQueries(["getAllMyCards"]);

        // update in getLists query Cache
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
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
              dispatch(hideModal());
              queryClient.invalidateQueries(["getCard", cardId]);
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

  const getCard = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/cards/${queryKey[1]}`);

    const { data } = response.data;

    return data;
  };

  const {
    data: card,
    isLoading,
    isRefetching,
    error,
  } = useQuery<CardDetailObj | undefined, any, CardDetailObj, string[]>(
    ["getCard", _id],
    getCard
  );

  if (isLoading) {
    return <CardDetailSkeleton />;
  }

  if (error) {
    if (error?.response) {
      const response = error.response;
      const { message } = response.data;

      switch (response.status) {
        case 400:
          queryClient.invalidateQueries(["getLists", boardId]);

          dispatch(addToast({ kind: ERROR, msg: message }));
          dispatch(hideModal());
          break;
        case 404:
          queryClient.invalidateQueries(["getCard", _id]);
          queryClient.invalidateQueries(["getBoard", boardId]);
          queryClient.invalidateQueries(["getLists", boardId]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);

          queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
          queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
          queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

          dispatch(addToast({ kind: ERROR, msg: message }));
          dispatch(hideModal());
          break;
        case 500:
          return (
            <ErrorCard
              isRefetching={isRefetching}
              queryKey={["getCard", _id]}
              msg={message}
            />
          );
        default:
          return (
            <ErrorCard
              isRefetching={isRefetching}
              queryKey={["getCard", _id]}
              msg={"Oops, something went wrong!"}
            />
          );
      }
    } else if (error?.request) {
      return (
        <ErrorCard
          isRefetching={isRefetching}
          queryKey={["getCard", _id]}
          msg={"Oops, something went wrong, Unable to get response back!"}
        />
      );
    } else {
      return (
        <ErrorCard
          isRefetching={isRefetching}
          msg={`Oops, something went wrong!`}
          queryKey={["getCard", _id]}
        />
      );
    }
  }

  return (
    <div className="card-detail-modal">
      {card && (
        <div className="card-detail-modal-content pb-8">
          {/* cover */}
          {card.color && (
            <div
              className="card-cover rounded-t"
              style={{
                width: "100%",
                height: "200px",
                background: `${card.color}`,
              }}
            >
              {card.coverImg && (
                <img
                  src={card.coverImg}
                  className="object-contain w-full h-full object-top rounded-t"
                  alt="card-cover"
                />
              )}
            </div>
          )}

          {/* name */}
          <div className="card-name px-4 mt-6 mr-8 flex items-center mb-6">
            <RiWindowFill size={22} className="mr-2" />
            {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(card.role) ? (
              <CardDetailName
                spaceId={spaceId}
                cardId={card._id}
                boardId={boardId}
                initialValue={card.name}
              />
            ) : (
              <h3 className="cursor-default font-semibold text-lg px-1.5 py-1 h-8">
                {card.name.length > 48
                  ? card.name.slice(0, 48) + "..."
                  : card.name}
              </h3>
            )}
          </div>

          <div className="card-body px-4 flex">
            <div
              className="left flex flex-col mr-6"
              style={{
                width: "600px",
              }}
            >
              {/* dueDate */}
              {card.dueDate && (
                <div className="due-date mb-6">
                  <span className="text-sm font-bold text-slate-600 block mb-2">
                    Due Date
                  </span>

                  <div className="bg-slate-200 px-2 py-1 rounded w-max flex items-center">
                    {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                      card.role
                    ) && (
                      <div className="toggle-isComplete mr-2">
                        <input
                          type="checkbox"
                          checked={card.isComplete ? true : false}
                          onChange={() => toggleIsComplete(card._id)}
                        />
                      </div>
                    )}
                    <span className="date">
                      {format(new Date(card.dueDate), "dd MMM, yyyy")}
                    </span>

                    <DueDateStatus
                      date={card.dueDate}
                      isComplete={card.isComplete}
                    />
                  </div>
                </div>
              )}

              {/* members */}
              {card.members && card.members.length > 0 && (
                <div className="members mb-6">
                  <span className="text-sm font-bold text-slate-600 block mb-2">
                    Members
                  </span>

                  <div className="members-content flex items-center flex-wrap gap-2">
                    {card.members.map((m) => (
                      <Profile
                        key={m._id}
                        classes="w-7 h-7 cursor-default"
                        src={m.profile}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* labels */}
              {card.labels && card.labels.length > 0 && (
                <div className="labels mb-6">
                  <span className="text-sm font-bold text-slate-600 block mb-2">
                    Labels
                  </span>

                  <div className="labels flex items-center flex-wrap gap-4 mb-6">
                    {card.labels
                      .sort((a: any, b: any) =>
                        a.pos > b.pos ? 1 : b.pos > a.pos ? -1 : 0
                      )
                      .map((l) => (
                        <div
                          key={l._id}
                          className="label text-sm p-1 rounded font-semibold text-white"
                          style={{
                            background: l.color,
                          }}
                        >
                          {l.name && l.name.length > 28
                            ? l.name?.slice(0, 28) + "..."
                            : l.name}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* description */}
              <div className="description mb-6">
                <div className="top flex items-center mb-2">
                  <HiMenuAlt2 size={22} className="mr-2" />
                  <h3 className="text-lg font-semibold text-slate-700 mr-4">
                    Description
                  </h3>

                  {!showDescEdit &&
                    [BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                      card.role
                    ) && (
                      <button
                        className="btn-gray"
                        onClick={() => setShowDescEdit(true)}
                      >
                        Edit
                      </button>
                    )}
                </div>

                <div className="content pl-4">
                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                    card.role
                  ) && showDescEdit ? (
                    <CardDescription
                      showDescEdit={showDescEdit}
                      setShowDescEdit={setShowDescEdit}
                      boardId={boardId}
                      cardId={card._id}
                      initialValue={card.description || ""}
                      spaceId={spaceId}
                    />
                  ) : (
                    <p>{card.description}</p>
                  )}
                </div>
              </div>

              {/* comments */}
              <div className="comments mb-6">
                <div className="top flex items-center mb-4">
                  <HiOutlineChatAlt size={22} className="mr-2" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Comments
                  </h3>
                </div>
                <div className="content flex flex-col">
                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                    card.role
                  ) && (
                    <AddComment
                      queryKey={["getCard", _id]}
                      cardId={card._id}
                      boardId={boardId}
                      spaceId={spaceId}
                    />
                  )}

                  <div className="actual-comments">
                    {card.comments &&
                      card.comments.map((c: any) => (
                        <Comment
                          key={c._id}
                          comment={c}
                          myRole={card.role}
                          cardId={card._id}
                          boardId={boardId}
                          spaceId={spaceId}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(card.role) && (
              <div
                className="right flex flex-col gap-y-4"
                style={{
                  width: "150px",
                }}
              >
                <AddMemberBtn
                  members={card.members}
                  listId={card.listId}
                  cardId={card._id}
                  boardId={boardId}
                  spaceId={spaceId}
                />
                <AddLabelBtn
                  listId={card.listId}
                  cardId={card._id}
                  boardId={boardId}
                  spaceId={spaceId}
                />

                <DueDateBtn
                  dueDate={card.dueDate}
                  listId={card.listId}
                  cardId={card._id}
                  boardId={boardId}
                  spaceId={spaceId}
                />
                <AddCoverBtn
                  coverImg={card.coverImg}
                  color={card.color}
                  listId={card.listId}
                  cardId={card._id}
                  boardId={boardId}
                  spaceId={spaceId}
                />

                <button
                  className="bg-red-400 rounded text-sm text-white p-2 flex items-center font-normal"
                  onClick={() => deleteCard(card._id)}
                >
                  <HiOutlineTrash size={16} className="mr-1" />
                  Delete Card
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDetailModal;
