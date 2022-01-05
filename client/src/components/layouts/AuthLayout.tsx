import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/app";

const AuthLayout = () => {
  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  // redirect, if already logged in
  if (accessToken || refreshToken) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <div className="auth w-screen h-screen overflow-y-auto flex items-center justify-center bg-blue-50">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
