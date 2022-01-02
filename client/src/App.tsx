import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./components/layouts/AuthLayout";
import DefaultLayout from "./components/layouts/DefaultLayout";
import ProjectLayout from "./components/layouts/ProjectLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Notifications from "./pages/Notifications";
import BoardDetail from "./pages/projects/boards/BoardDetail";
import ProjectBoards from "./pages/projects/ProjectBoards";
import ProjectMembers from "./pages/projects/ProjectMembers";
import ProjectSettings from "./pages/projects/ProjectSettings";

import PrivateRoute from "./PrivateRoute";

const Home = lazy(() => import("./pages/Home"));
const Settings = lazy(() => import("./pages/Settings"));
const Error404 = lazy(() => import("./pages/Error404"));

const App = () => {
  return (
    <div>
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

            {/* /p/:id/b/:id/* */}
            <Route path="/p/:id/b/:boardId" element={<BoardDetail />} />

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
