import React from "react";
import { HiOutlineUserAdd, HiUserAdd } from "react-icons/hi";

const InviteBtn = () => {
  return (
    <button className="bg-blue-500 rounded px-2 py-1.5 text-white flex items-center">
      <HiOutlineUserAdd className="mr-1" size={16} />
      Invite
    </button>
  );
};

export default InviteBtn;
