import React from "react";
import { MdOutlineTimeline } from "react-icons/md";

const Logo = () => {
  return (
    <div className="flex items-center">
      <div className="mr-1">
        <MdOutlineTimeline size={21} />
      </div>
      <h3 className="text-xl font-ubuntu font-normal">workflow</h3>
    </div>
  );
};

export default Logo;
