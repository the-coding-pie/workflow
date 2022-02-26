import React from "react";
import { HiOutlineUser } from "react-icons/hi";

const AddMemberBtn = () => {
  return (
    <div className="add-member-btn">
      <button className="card-detail-btn">
        <HiOutlineUser size={16} className="mr-1" />
        Members
      </button>
    </div>
  );
};

export default AddMemberBtn;
