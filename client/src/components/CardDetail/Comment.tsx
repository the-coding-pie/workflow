import { AxiosError } from "axios";
import React, { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { RootState } from "../../redux/app";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { CommentObj } from "../../types";
import { BOARD_ROLES, ERROR } from "../../types/constants";
import { getDate } from "../../utils/helpers";
import Profile from "../Profile/Profile";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  comment: CommentObj;
  cardId: string;
  boardId: string;
  spaceId: string;
}

const Comment = ({ myRole, comment, cardId, spaceId, boardId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { user } = useSelector((state: RootState) => state.auth);
  const [value, setValue] = useState(comment.comment);
  const [isEdit, setIsEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [isFirst, setIsFirst] = useState(true);

  const ref = useClose(() => setShowDelete(false));

  const refMain = useClose(() => {
    setIsEdit(false);
    setIsFirst(true);
    setValue(comment.comment);
  });

  const updateComment = (
    cardId: string,
    commentId: string,
    newComment: string
  ) => {
    // send PUT request to backend
    axiosInstance
      .put(
        `/cards/${cardId}/comments`,
        {
          comment: newComment,
          commentId: commentId,
        },
        {
          headers: {
            ContentType: "application/json",
          },
        }
      )
      .then((response) => {
        setIsEdit(false);

        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            comments: oldValue.comments.map((c: CommentObj) => {
              if (c._id === commentId) {
                return {
                  ...c,
                  comment: newComment,
                };
              }
              return c;
            }),
          };
        });
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

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
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

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
            case 500:
              queryClient.invalidateQueries(["getCard", cardId]);
              dispatch(hideModal());
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

  const deleteComment = (commentId: string, cardId: string) => {
    axiosInstance
      .delete(`/cards/${cardId}/comments`, {
        data: {
          commentId: commentId,
        },
        headers: {
          ContentType: "application/json",
        },
      })
      .then((response) => {
        setShowDelete(false);

        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.invalidateQueries(["getLists", boardId]);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            comments: oldValue.comments.filter(
              (c: CommentObj) => c._id !== commentId
            ),
          };
        });
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

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
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

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
            case 500:
              queryClient.invalidateQueries(["getCard", cardId]);
              dispatch(hideModal());
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
    <div
      ref={refMain}
      className="comment flex items-start w-full mb-6 last:mb-0"
    >
      <Profile
        classes="w-7 h-7 cursor-pointer mr-4"
        src={comment.user.profile}
      />

      <div className="right flex flex-col w-full">
        <div className="top mb-2 text-sm">
          <span className="username font-semibold mr-2">
            {comment.user.username}
          </span>
          <span className="time mr-1">{getDate(comment.createdAt)}</span>
          {comment.isUpdated && <span className="isUpdated">(edited)</span>}
        </div>

        {isEdit ? (
          <div className="flex flex-col w-full">
            <textarea
              onFocus={(e) => isFirst && e.target.select()}
              autoFocus
              className="w-full shadow-lg border outline-none p-2 rounded resize-none h-24 mb-4"
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => setIsFirst(false)}
              value={value}
              placeholder="Write a comment"
            ></textarea>

            <div className="buttons flex items-center">
              <button
                disabled={value === ""}
                onClick={() => updateComment(cardId, comment._id, value)}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed w-20 mr-2"
              >
                Save
              </button>
              <button
                className="text-sm text-slate-700"
                onClick={(e) => {
                  setIsEdit(false);
                  setIsFirst(true);
                  setValue(comment.comment);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="comment shadow w-full p-2 mb-2">
            {comment.comment}
          </div>
        )}

        {!isEdit && (
          <div className="buttons text-sm flex items-center">
            {comment.user._id === user?._id && (
              <button
                className="text-slate-600 underline mr-2"
                onClick={(e) => setIsEdit(true)}
              >
                Edit
              </button>
            )}
            {(comment.user._id === user?._id ||
              (comment.user._id !== user?._id &&
                !comment.user.isAdmin &&
                myRole === BOARD_ROLES.ADMIN)) && (
              <div className="relative" ref={ref}>
                <button
                  onClick={() => {
                    setShowDelete((prevValue) => !prevValue);
                    setIsEdit(false);
                  }}
                  className="text-slate-600 underline mr-2 relative"
                >
                  Delete
                </button>

                {showDelete && (
                  <div
                    className="delete-confirmation rounded absolute top-5 text-base left-10 bg-white shadow-lg border"
                    style={{
                      width: "350px",
                    }}
                  >
                    <header className="flex items-center justify-between p-3 border-b mb-2">
                      <span className="font-semibold">Delete comment?</span>
                      <button onClick={() => setShowDelete(false)}>
                        <HiOutlineX size={18} />
                      </button>
                    </header>

                    <div className="body p-3">
                      <p className="mb-6">
                        Deleting a comment is forever. There is no undo.
                      </p>

                      <button
                        className="btn-danger w-full"
                        onClick={() => deleteComment(comment._id, cardId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
