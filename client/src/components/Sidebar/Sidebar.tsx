import React from "react";
import Logo from "../Logo/Logo";
import { HiOutlineChevronDoubleLeft } from "react-icons/hi";
import { VscHome } from "react-icons/vsc";
import { IoNotificationsOutline } from "react-icons/io5";
import { HiOutlinePlus } from "react-icons/hi";
import SidebarLink from "./SidebarLink";
import SpaceList from "../SpaceList/SpaceList";
import { useDispatch } from "react-redux";
import { hideSidebar } from "../../redux/features/sidebarSlice";
import { showModal } from "../../redux/features/modalSlice";
import { CREATE_SPACE_MODAL } from "../../types/constants";

const Sidebar = () => {
  const dispatch = useDispatch();

  return (
    <aside
      className={`sidebar border-r w-52 bg-white h-screen flex flex-col transition ease-in-out delay-75`}
    >
      <header className="h-14 flex justify-between items-center px-4 mb-3">
        <Logo />

        <button
          onClick={() => dispatch(hideSidebar())}
          className="text-violet-500"
        >
          <HiOutlineChevronDoubleLeft size={19} />
        </button>
      </header>

      <nav className="border-b pb-3">
        <SidebarLink to="/" Icon={VscHome} text="Home" />
        <SidebarLink
          to="/notifications"
          Icon={IoNotificationsOutline}
          text="Notifications"
        />
      </nav>

      <div className="spaces flex-1 overflow-y-auto">
        <div className="top flex items-center justify-between px-4 py-4">
          <h3 className="text-sm font-medium">SPACES</h3>
          <button
            className="text-gray-600"
            onClick={() =>
              dispatch(
                showModal({
                  modalType: CREATE_SPACE_MODAL,
                })
              )
            }
          >
            <HiOutlinePlus size={16} />
          </button>
        </div>

        <SpaceList />
      </div>
    </aside>
  );
};

export default Sidebar;
