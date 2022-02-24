import React from "react";
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
  return (
    <div className="comment flex items-start w-full">
      <Profile classes="w-7 h-7 cursor-pointer mr-4" src={comment.user.profile} />

      <div className="right flex flex-col w-full">
        <div className="top mb-2 text-sm">
          <span className="username font-semibold mr-2">{comment.user.username}</span>
          <span className="time mr-1">{comment.createdAt}</span> 
          {comment.isUpdated && <span className="isUpdated">(edited)</span>}
        </div>

        <div className="comment shadow w-full p-2">
          {comment.comment}
        </div>
      </div>
    </div>
  );
};

export default Comment;
