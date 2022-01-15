import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import Notifications from "../../pages/Notifications";
import BoardDetail from "../../pages/spaces/boards/BoardDetail";
import SpaceBoards from "../../pages/spaces/SpaceBoards";
import SpaceMembers from "../../pages/spaces/SpaceMembers";
import SpaceSettings from "../../pages/spaces/SpaceSettings";
import { RootState } from "../../redux/app";
import Header from "../Header/Header";
import Modal from "../Modal/Modal";
import Sidebar from "../Sidebar/Sidebar";
import SpaceLayout from "./SpaceLayout";

const Home = lazy(() => import("../../pages/Home"));
const Settings = lazy(() => import("../../pages/Settings"));
const Error404 = lazy(() => import("../../pages/Error404"));

const DefaultLayout = () => {
  const { show } = useSelector((state: RootState) => state.sidebar);
  const modal = useSelector((state: RootState) => state.modal);

  return (
    <div className="relative">
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

                {/* /s/:id/* */}
                <Route path="/s/:id/" element={<SpaceLayout />}>
                  <Route
                    path=""
                    element={<Navigate to="boards" replace={true} />}
                  />
                  <Route path="boards" element={<SpaceBoards />} />
                  <Route path="members" element={<SpaceMembers />} />
                  <Route path="settings" element={<SpaceSettings />} />
                </Route>

                {/* /b/:id/* */}
                <Route path="/b/:boardId" element={<BoardDetail />} />

                {/* /404 */}
                <Route path="/404" element={<Error404 />} />
                <Route
                  path="*"
                  element={<Navigate to="/404" replace={true} />}
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>

      {/* modal */}
      {modal.modalType !== null && <Modal {...modal} />}
    </div>
  );
};

export default DefaultLayout;
