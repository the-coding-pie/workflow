import React, { useEffect } from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface Props {
  to: string;
  list?: string[];
  fn?: Function;
  onClick?: Function;
  showUnderline?: boolean;
  children: React.ReactNode;
}

const CustomNavLink = ({
  to,
  list,
  fn,
  showUnderline = true,
  children,
  onClick,
}: Props) => {
  const location = useLocation();
  const pathname = location.pathname;

  const [isActive, setIsActive] = useState<boolean>();

  useEffect(() => {
    setIsActive(pathname === to || list?.includes(pathname));
  }, [pathname, list]);

  useEffect(() => {
    if (isActive !== undefined && fn) {
      fn(isActive as boolean);
    }
  }, [isActive]);

  return (
    <Link
      onClick={(e) => {
        onClick && onClick(e);
      }}
      to={to}
      className={`text-sm ${
        showUnderline
          ? "hover:underline decoration-dashed outline-violet-500 underline-offset-4"
          : ""
      } ${isActive ? "active" : ""}`}
    >
      {children}
    </Link>
  );
};

export default CustomNavLink;
