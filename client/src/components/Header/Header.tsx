import React from "react";
import ProfileCard from "./ProfileCard";
import { HiOutlineMenu } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { showSidebar } from "../../redux/features/sidebarSlice";
import { RootState } from "../../redux/app";
import axios from "axios";
import {
  setCurrentUser,
  setEmailVerified,
} from "../../redux/features/authSlice";
import { useQuery } from "react-query";
import { UserObj } from "../../types";
import { BASE_URL } from "../../config";

const Header = () => {
  const dispatch = useDispatch();

  const { show } = useSelector((state: RootState) => state.sidebar);
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="header h-14 border-b bg-white flex items-center justify-between px-4">
      <div className="left flex items-center justify-start">
        {!show && (
          <button
            className="hover:text-violet-500"
            onClick={() => dispatch(showSidebar())}
          >
            <HiOutlineMenu size={20} />
          </button>
        )}
      </div>
      <div className="right">
        {user ? <ProfileCard user={user} /> : <ProfileCard user={null} />}
      </div>
    </header>
  );
};

export default Header;
