import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";

const DefaultLayout = () => {
  return (
    <div className="flex">
      <div className="left">
        <Sidebar />
      </div>
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
