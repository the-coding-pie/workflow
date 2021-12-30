import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const accessToken = "";

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
