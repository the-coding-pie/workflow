import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "./components/layouts/AuthLayout";
import Toasts from "./components/Toasts/Toasts";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "./PrivateRoute";
import MainLayout from "./components/layouts/MainLayout";
import EmailVerify from "./pages/EmailVerify";
import { WARNING } from "./types/constants";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

const App = () => {
  return (
    <div>
      <Toasts />
      <ToastContainer position="top-right" />

      <BrowserRouter>
        <Routes>
          {/* /password/recover/:token password - new password page */}
          <Route path="reset-password/:token" element={<ResetPassword />} />

          {/* /reset-password put email here */}
          <Route path="forgot-password" element={<AuthLayout />}>
            <Route index element={<ForgotPassword />} />
          </Route>

          {/* /auth */}
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            <Route
              path="*"
              element={<Navigate to="/auth/login" replace={true} />}
            />
          </Route>

          <Route
            path="/email/verify/:token"
            element={
              <PrivateRoute
                toast={{
                  kind: WARNING,
                  msg: "Please log in to Workflow before verifying your email address",
                }}
              >
                <EmailVerify />
              </PrivateRoute>
            }
          />

          {/* /* */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
