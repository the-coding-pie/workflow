import { Outlet } from "react-router-dom";

const DefaultLayout = () => {
  return (
    <div>
      DefaultLayout
      <Outlet />
    </div>
  );
};

export default DefaultLayout;
