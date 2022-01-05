import React, { useState } from "react";
import { IconType } from "react-icons";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";

interface Props {
  to: string;
  Icon: IconType;
  text: string;
}

const SidebarLink = ({ to, Icon, text }: Props) => {
  const [currentActive, setCurrentActive] = useState(false);

  return (
    <NavLink
      end
      to={to}
      className={({ isActive }) => {
        setCurrentActive(isActive);

        return `relative flex items-center px-4 py-2  text-sm ${
          isActive ? "bg-primary_light hover:bg-none" : "hover:bg-secondary"
        }`;
      }}
    >
      {currentActive && (
        <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-xl rounded-br-xl"></span>
      )}

      <div className="mr-2">
        <Icon size={20} />
      </div>
      <span>{text}</span>
    </NavLink>
  );
};

export default SidebarLink;
