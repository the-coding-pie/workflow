import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/app";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

const DefaultLayout = () => {
  const { show } = useSelector((state: RootState) => state.sidebar);
  const { emailVerified } = useSelector((state: RootState) => state.auth);

  if (emailVerified === false) {
    return (
      <Navigate replace to="/email/notverified" state={{ from: location }} />
    );
  }

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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
