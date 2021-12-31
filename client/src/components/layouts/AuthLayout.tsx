import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/app";

const AuthLayout = () => {
  const { accessToken } = useSelector((state: RootState) => state.auth);

  // redirect, if already logged in
  if (accessToken) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <div>
      AuthLayout
      <Outlet />
    </div>
  );
};

export default AuthLayout;
