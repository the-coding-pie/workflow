import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import BoardDetail from "../../pages/spaces/boards/BoardDetail";
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
    <div className="layout relative">
      <div className="layout__content flex">
        <Sidebar />

        <main
          className={`main flex-1 flex flex-col ${show ? "ml-60" : ""}`}
          style={{
            minHeight: "100vh",
          }}
        >
          <Header />
          <div className="page-wrapper flex-1 mt-14">
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Settings />} />

                {/* /s/:id/* */}
                <Route path="/s/:id/*" element={<SpaceLayout />} />

                {/* /b/:id */}
                <Route path="/b/:id" element={<BoardDetail />} />

                {/* /404 */}
                <Route path="/404" element={<Error404 />} />
                <Route
                  path="*"
                  element={<Navigate to="/404" replace={true} />}
                />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>

      {/* modal */}
      {modal.modalType !== null && <Modal {...modal} />}
    </div>
  );
};

export default DefaultLayout;
