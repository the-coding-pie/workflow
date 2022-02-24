import React, { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { useSelector } from "react-redux";
import useClose from "../../hooks/useClose";
import { RootState } from "../../redux/app";
import { CommentObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";
import Profile from "../Profile/Profile";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  comment: CommentObj;
}

const Comment = ({ myRole, comment }: Props) => {
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

  const updateComment = (commentId: string, newComment: string) => {
    // send PUT request to backend
    console.log(commentId);
    console.log(newComment);
  };

  const deleteComment = (commentId: string) => {
    // send DELETE request to backend
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
          <span className="time mr-1">{comment.createdAt}</span>
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
                onClick={() => updateComment(comment._id, value)}
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
                        onClick={() => deleteComment(comment._id)}
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
