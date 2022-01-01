import { Outlet } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";

const DefaultLayout = () => {
  return (
    <div className="flex">
      <div className="left">
        <Sidebar />
      </div>
      <div className="right">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
