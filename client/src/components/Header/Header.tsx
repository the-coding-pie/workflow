import React from "react";
import ProfileCard from "./ProfileCard";
import { HiOutlineMenu } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { showSidebar } from "../../redux/features/sidebarSlice";
import { RootState } from "../../redux/app";
import axios from "axios";
import { setCurrentUser } from "../../redux/features/authSlice";
import { useQuery } from "react-query";
import { UserObj } from "../../types";
import { BASE_URL } from "../../config";

const Header = () => {
  const dispatch = useDispatch();

  const { show } = useSelector((state: RootState) => state.sidebar);
  const { user } = useSelector((state: RootState) => state.auth);

  // get current user info
  const getCurrentUser = () =>
    axios.get(`/users/getCurrentUser`).then((response) => {
      const { data } = response.data;

      dispatch(setCurrentUser(data));
      return data;
    });

  const { data, isLoading, error } = useQuery<
    UserObj | undefined,
    Error,
    UserObj,
    string[]
  >(["getCurrentUser"], getCurrentUser);

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
        {user ? (
          <ProfileCard img={user.profile} alt={`${user.username} profile`} />
        ) : (
          <ProfileCard img={undefined} alt={undefined} />
        )}
      </div>
    </header>
  );
};

export default Header;
