import React from "react";
import { HiOutlineTag } from "react-icons/hi";

const AddLabelBtn = () => {
  return (
    <div className="add-label-btn">
      <button className="card-detail-btn">
        <HiOutlineTag size={16} className="mr-1" />
        Labels
      </button>
    </div>
  );
};

export default AddLabelBtn;
