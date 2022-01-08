import axios from "axios";
import React from "react";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import EmailNotVerified from "../../pages/EmailNotVerified";
import { RootState } from "../../redux/app";
import { setCurrentUser } from "../../redux/features/authSlice";
import { UserObj } from "../../types";
import DefaultLayout from "./DefaultLayout";

// deciding layout
const MainLayout = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  // get current user info
  const getCurrentUser = async () => {
    const response = await axios.get(`/users/getCurrentUser`);

    const { data } = response.data;

    dispatch(
      setCurrentUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        profile: data.profile,
        emailVerified: data.emailVerified,
      })
    );
    return data;
  };

  const { error } = useQuery<UserObj | undefined, Error, UserObj, string[]>(
    ["getCurrentUser"],
    getCurrentUser
  );

  if (user) {
    if (user.emailVerified === true) {
      return <DefaultLayout />;
    } else {
      return <EmailNotVerified />;
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {error ? "Something went wrong, please refresh the screen" : "Loading..."}
    </div>
  );
};

export default MainLayout;
