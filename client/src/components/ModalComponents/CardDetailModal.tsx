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
  HiOutlineUser,
  HiTag,
} from "react-icons/hi";
import CardDescription from "../CardDetail/CardDescription";
import AddComment from "../CardDetail/AddComment";

interface Props {
  _id: string;
  boardId: string;
  spaceId: string;
}

const CardDetailModal = ({ _id, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [showDescEdit, setShowDescEdit] = useState(false);

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
              className="card-cover"
              style={{
                width: "100%",
                height: "200px",
                background: `${card.color}`,
              }}
            >
              {card.coverImg && (
                <img
                  src={card.coverImg}
                  className="object-contain w-full h-full object-top"
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
                <div className="due-date mb-4">{card.dueDate}</div>
              )}

              {/* members */}
              {card.members && card.members.length > 0 && (
                <div className="members mb-4">
                  <span className="text-sm font-bold text-slate-600">
                    Members
                  </span>

                  <div className="members-content">
                    {card.members.length > 5 ? (
                      <div className="flex items-center">
                        {card.members?.slice(0, 5).map((m) => (
                          <Profile
                            key={m._id}
                            classes="w-7 h-7 cursor-pointer"
                            src={m.profile}
                          />
                        ))}
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-medium">
                          +{card.members!.slice(5).length}
                        </div>
                      </div>
                    ) : (
                      card.members.map((m) => (
                        <Profile
                          key={m._id}
                          classes="w-7 h-7 cursor-pointer"
                          src={m.profile}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* labels */}
              {card.labels && card.labels.length > 0 && (
                <div className="labels mb-4">
                  {card.labels.map((l) => (
                    <div key={l._id} className="label">
                      {l.name}
                    </div>
                  ))}
                </div>
              )}

              {/* description */}
              <div className="description mb-4">
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
              <div className="comments mb-4">
                <div className="top flex items-center">
                  <HiOutlineChatAlt size={22} className="mr-2" />
                  <h3 className="text-lg font-semibold text-slate-700">
                    Comments
                  </h3>
                </div>
                <div className="content flex flex-col">
                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(
                    card.role
                  ) && <AddComment />}

                  <div className="actual-comments">
                    {card.comments &&
                      card.comments.map((c) => (
                        <div className="comment">{c.comment}</div>
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
                <button className="card-detail-btn">
                  <HiOutlineUser size={16} className="mr-1" />
                  Members
                </button>
                <button className="card-detail-btn">
                  <HiOutlineTag size={16} className="mr-1" />
                  Labels
                </button>
                <button className="card-detail-btn">
                  <HiOutlineClock size={16} className="mr-1" />
                  Due date
                </button>
                <button className="card-detail-btn">
                  <RiWindowFill size={16} className="mr-1" />
                  Cover
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
