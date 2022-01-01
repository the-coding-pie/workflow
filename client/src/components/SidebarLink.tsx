import React from "react";
import { IconType } from "react-icons";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";

interface Props {
  to: string;
  Icon: IconType;
  text: string;
}

const SidebarLink = ({ to, Icon, text }: Props) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 hover:bg-stone-200 text-sm ${
          isActive ? "bg-stone-200 hover:bg-none" : ""
        }`
      }
    >
      <div className="mr-2">
        <Icon size={20} />
      </div>
      <span>{text}</span>
    </NavLink>
  );
};

export default SidebarLink;
