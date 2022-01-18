import axios from "axios";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "./components/layouts/AuthLayout";
import Toasts from "./components/Toasts/Toasts";
import { BASE_URL } from "./config";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "./PrivateRoute";
import { store } from "./redux/app";
import { logoutUser, setAccessToken } from "./redux/features/authSlice";
import MainLayout from "./components/layouts/MainLayout";
import EmailVerify from "./pages/EmailVerify";
import { WARNING } from "./types/constants";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

// axios defaults
axios.defaults.baseURL = BASE_URL;

// interceptors
// Request interceptor
axios.interceptors.request.use(
  (config: any) => {
    // bottom line is required, if you are using react-query or something similar
    if (config.headers["Authorization"]) {
      config.headers["Authorization"] = null;
    }
    config.headers["Authorization"] =
      "Bearer " + store.getState().auth.accessToken;
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// for multiple requests
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    const originalRequest = error.config;

    // if refresh also fails with 401
    if (
      error.response.status === 401 &&
      originalRequest.url.includes("refresh")
    ) {
      store.dispatch(logoutUser());
    }

    // // if retried request failed with 401 status
    // if (error.response.status === 401 && originalRequest._retry) {
    //   // doesn't stops here, but also shows all the toast below due to Promise reject at the bottom
    //   return store.dispatch(logoutUser());
    // }

    if (
      error.response.status === 401 &&
      !originalRequest.url.includes("login") &&
      !originalRequest._retry
    ) {
      // if refreshing logic is happening, then push subsequent req to the queue
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(function (resolve, reject) {
        axios
          .post(`${BASE_URL}/auth/refresh`, {
            refreshToken: store.getState().auth.refreshToken,
          })
          .then((response) => {
            // get the accessToken
            const { accessToken } = response.data.data;

            store.dispatch(setAccessToken(accessToken));

            processQueue(null, accessToken);
            resolve(axios(originalRequest));
          })
          .catch((error) => {
            processQueue(error, null);
            reject(error);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

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
