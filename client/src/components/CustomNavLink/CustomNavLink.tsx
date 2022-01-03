import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface Props {
  to: string;
  list?: string[];
  fn?: Function;
  children: React.ReactNode;
}

const CustomNavLink = ({ to, list, fn, children }: Props) => {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = pathname === to || list?.includes(pathname);

  useEffect(() => {
    if (isActive !== undefined && fn) {
      fn(isActive as boolean);
    }
  }, [isActive]);

  return (
    <Link
      to={to}
      className={`text-sm hover:underline decoration-dashed outline-violet-500 underline-offset-4 ${
        isActive ? "active" : ""
      }`}
    >
      {children}
    </Link>
  );
};

export default CustomNavLink;
