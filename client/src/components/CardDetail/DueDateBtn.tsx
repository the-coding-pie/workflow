import React from "react";
import { HiOutlineClock } from "react-icons/hi";

const DueDateBtn = () => {
  return (
    <div className="due-date-btn">
      <button className="card-detail-btn">
        <HiOutlineClock size={16} className="mr-1" />
        Due date
      </button>
    </div>
  );
};

export default DueDateBtn;
