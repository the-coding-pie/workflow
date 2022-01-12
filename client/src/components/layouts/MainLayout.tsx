import axios from "axios";
import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import EmailNotVerified from "../../pages/EmailNotVerified";
import { RootState } from "../../redux/app";
import { logoutUser, setCurrentUser } from "../../redux/features/authSlice";
import { UserObj } from "../../types";
import DefaultLayout from "./DefaultLayout";

// deciding layout
const MainLayout = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { user } = useSelector((state: RootState) => state.auth);

  // get current user info
  const getCurrentUser = async () => {
    const response = await axios.get(`/users/getCurrentUser`);
    const { data } = response.data;

    return data;
  };

  const { data, error } = useQuery<UserObj | undefined, any, UserObj, string[]>(
    ["getCurrentUser"],
    getCurrentUser
  );

  useEffect(() => {
    if (data) {
      dispatch(
        setCurrentUser({
          _id: data._id,
          username: data.username,
          email: data.email,
          profile: data.profile,
          emailVerified: data.emailVerified,
          isOAuth: data.isOAuth,
        })
      );
    }
  }, [data]);

  if (error && error.response) {
    const response = error.response;

    if (response.status === 401) {
      queryClient.removeQueries();
      dispatch(logoutUser());
    }
  }

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
