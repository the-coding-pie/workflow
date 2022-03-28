import React from "react";
import { MdOutlineTimeline } from "react-icons/md";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center">
      <div className="mr-1">
        <MdOutlineTimeline size={21} />
      </div>
      <h3 className="text-xl font-ubuntu font-normal">workflow</h3>
    </Link>
  );
};

export default Logo;
