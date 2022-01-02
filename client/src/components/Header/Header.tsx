import React from "react";
import ProfileCard from "./ProfileCard";

const Header = () => {
  return (
    <header className="header h-14 bg-white flex items-center justify-between px-4">
      <div className="left"></div>
      <div className="right">
        <ProfileCard />
      </div>
    </header>
  );
};

export default Header;
