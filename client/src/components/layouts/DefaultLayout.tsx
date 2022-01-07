import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import Notifications from "../../pages/Notifications";
import BoardDetail from "../../pages/projects/boards/BoardDetail";
import ProjectBoards from "../../pages/projects/ProjectBoards";
import ProjectMembers from "../../pages/projects/ProjectMembers";
import ProjectSettings from "../../pages/projects/ProjectSettings";
import { RootState } from "../../redux/app";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import ProjectLayout from "./ProjectLayout";

const Home = lazy(() => import("../../pages/Home"));
const Settings = lazy(() => import("../../pages/Settings"));
const Error404 = lazy(() => import("../../pages/Error404"));

const DefaultLayout = () => {
  const { show } = useSelector((state: RootState) => state.sidebar);

  return (
    <div className="flex">
      {show && (
        <div className="left">
          <Sidebar />
        </div>
      )}
      <div className="right w-full">
        <Header />
        <main>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
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
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
