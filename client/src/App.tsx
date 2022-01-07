import axios from "axios";
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthLayout from "./components/layouts/AuthLayout";
import DefaultLayout from "./components/layouts/DefaultLayout";
import ProjectLayout from "./components/layouts/ProjectLayout";
import Toasts from "./components/Toasts/Toasts";
import { BASE_URL } from "./config";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Notifications from "./pages/Notifications";
import BoardDetail from "./pages/projects/boards/BoardDetail";
import ProjectBoards from "./pages/projects/ProjectBoards";
import ProjectMembers from "./pages/projects/ProjectMembers";
import ProjectSettings from "./pages/projects/ProjectSettings";

import "react-toastify/dist/ReactToastify.css";

import PrivateRoute from "./PrivateRoute";
import { store } from "./redux/app";
import { logoutUser, setAccessToken } from "./redux/features/authSlice";
import EmailNotVerified from "./pages/EmailNotVerified";

const Home = lazy(() => import("./pages/Home"));
const Settings = lazy(() => import("./pages/Settings"));
const Error404 = lazy(() => import("./pages/Error404"));

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

    if (
      error.response.status === 401 &&
      originalRequest.url.includes("refresh")
    ) {
      store.dispatch(logoutUser());
    }

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
          {/* /auth */}
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* / */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Suspense fallback={<div>Loading...</div>}>
                  <DefaultLayout />
                </Suspense>
              </PrivateRoute>
            }
          >
            {/* /email/notverified */}
            <Route element={<EmailNotVerified />} path="/email/notverified" />

            <Route index element={<Home />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />

            {/* /p/:id/* */}
            <Route path="/p/:id/" element={<ProjectLayout />}>
              <Route
                path=""
                element={<Navigate to="boards" replace={true} />}
              />
              <Route path="boards" element={<ProjectBoards />} />
              <Route path="members" element={<ProjectMembers />} />
              <Route path="settings" element={<ProjectSettings />} />
            </Route>

            {/* /b/:id/* */}
            <Route path="/b/:boardId" element={<BoardDetail />} />

            {/* /404 */}
            <Route path="/404" element={<Error404 />} />

            <Route path="*" element={<Navigate to="/404" replace={true} />} />
          </Route>

          {/* redirect */}
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
