import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { RootState } from "../../redux/app";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
