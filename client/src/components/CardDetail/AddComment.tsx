import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/app";
import ProfileCard from "../Header/ProfileCard";
import Profile from "../Profile/Profile";

const AddComment = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(comment);
  };

  return (
    <form className="flex items-start mb-6" onSubmit={(e) => handleSubmit(e)}>
      <Profile
        src={user!.profile}
        alt={`${user!.username} profile`}
        classes="mr-4"
      />

      <div className="flex flex-col w-full">
        <textarea
          className="w-full shadow focus:shadow-lg focus:border outline-none p-2 rounded resize-none h-24 mb-4"
          onChange={(e) => setComment(e.target.value)}
          value={comment}
          placeholder="Write a comment"
        ></textarea>

        <button
          type="submit"
          disabled={comment === ""}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed w-20"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default AddComment;
