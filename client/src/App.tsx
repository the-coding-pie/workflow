import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./components/layouts/AuthLayout";
import DefaultLayout from "./components/layouts/DefaultLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

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
            <Route path="/settings" element={<Settings />} />

            <Route path="*" element={<Error404 />} />
          </Route>

          {/* redirect */}
          <Route path="*" element={<Navigate to="/" replace={true} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
