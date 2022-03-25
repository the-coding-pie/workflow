import React, { useState } from "react";
import Logo from "../Logo/Logo";
import {
  HiChevronDown,
  HiChevronRight,
  HiOutlineChevronDoubleLeft,
} from "react-icons/hi";
import { VscHome } from "react-icons/vsc";
import { IoNotificationsOutline, IoSettingsOutline } from "react-icons/io5";
import { HiOutlinePlus } from "react-icons/hi";
import SidebarLink from "./SidebarLink";
import SpaceList from "./SpaceList/SpaceList";
import { useDispatch, useSelector } from "react-redux";
import { hideSidebar } from "../../redux/features/sidebarSlice";
import { showModal } from "../../redux/features/modalSlice";
import { CREATE_SPACE_MODAL } from "../../types/constants";
import FavoritesList from "./FavoritesList/FavoritesList";
import { useRef } from "react";
import { RootState } from "../../redux/app";
import { setCurrentActiveMenu } from "../../redux/features/sidebarMenu";
import CustomReactToolTip from "../CustomReactToolTip/CustomReactToolTip";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentActiveMenu } = useSelector(
    (state: RootState) => state.sidebarMenu
  );
  const { show } = useSelector((state: RootState) => state.sidebar);

  const ref = useRef<any>(null);

  const [menu, setMenu] = useState([
    {
      id: 0,
      button: null,
      name: "Favorites",
      component: <FavoritesList />,
    },
    {
      id: 1,
      name: "Spaces",
      button: (
        <>
          <button
            data-for="create-space"
            data-tip="Create Space"
            ref={ref}
            className="text-gray-600"
            onClick={() =>
              dispatch(
                showModal({
                  modalType: CREATE_SPACE_MODAL,
                })
              )
            }
          >
            <HiOutlinePlus size={15} />
          </button>
          <CustomReactToolTip id="create-space" />
        </>
      ),
      component: <SpaceList />,
    },
  ]);

  return (
    <aside
      className={`sidebar z-30 shadow-xl fixed left-0 top-0 bottom-0 overflow-x-hidden box-border ${
        show ? "w-60" : "hidden"
      } bg-white h-screen flex flex-col transition-all`}
    >
      <header className="h-14 flex justify-between items-center px-4 border-b">
        <Logo />

        <button
          onClick={() => dispatch(hideSidebar())}
          className="text-violet-500"
        >
          <HiOutlineChevronDoubleLeft size={19} />
        </button>
      </header>

      <main className="flex-1 mb-1" id="sidebar">
        <nav className="border-b pb-3">
          <SidebarLink to="/" Icon={VscHome} text="Home" />
          <SidebarLink
            to="/profile"
            Icon={IoSettingsOutline}
            text="Settings"
          />
        </nav>

        <ul className="text-sm">
          {menu.map((m) => (
            <li
              key={m.id}
              className={`border-b ${
                currentActiveMenu === m.id ? "text-gray-800" : "text-gray-500 "
              }`}
            >
              <div
                aria-label="clickable"
                onClick={(e) => {
                  // if plus btn is there
                  if (ref.current) {
                    // if the click is not on plus btn
                    if (!ref.current.contains(e.target)) {
                      dispatch(
                        setCurrentActiveMenu(
                          currentActiveMenu === m.id ? null : m.id
                        )
                      );
                    }
                  } else {
                    dispatch(
                      setCurrentActiveMenu(
                        currentActiveMenu === m.id ? null : m.id
                      )
                    );
                  }
                }}
                className={`flex items-center px-2 py-3 w-full justify-between noselect ${
                  currentActiveMenu === m.id
                    ? "bg-secondary"
                    : "hover:bg-secondary"
                }  cursor-pointer sticky top-0 left-0 right-0 z-20 bg-white`}
              >
                <div className="left flex items-center">
                  <div className="icon mr-2">
                    {currentActiveMenu === m.id ? (
                      <HiChevronDown size={18} />
                    ) : (
                      <HiChevronRight size={18} />
                    )}
                  </div>
                  <h3
                    className="uppercase"
                    style={{
                      fontSize: "13px",
                    }}
                  >
                    {m.name}
                  </h3>
                </div>
                {m.button && m.button}
              </div>

              <div
                className={`content ${
                  currentActiveMenu === m.id ? "block" : "hidden"
                }`}
              >
                {m.component}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </aside>
  );
};

export default Sidebar;
