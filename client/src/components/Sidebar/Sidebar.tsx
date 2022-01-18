import React, { useState } from "react";
import Logo from "../Logo/Logo";
import {
  HiChevronDown,
  HiChevronRight,
  HiOutlineChevronDoubleLeft,
} from "react-icons/hi";
import { VscHome } from "react-icons/vsc";
import { IoNotificationsOutline } from "react-icons/io5";
import { HiOutlinePlus } from "react-icons/hi";
import SidebarLink from "./SidebarLink";
import SpaceList from "./SpaceList/SpaceList";
import { useDispatch, useSelector } from "react-redux";
import { hideSidebar } from "../../redux/features/sidebarSlice";
import { showModal } from "../../redux/features/modalSlice";
import { CREATE_BOARD_MODAL, CREATE_SPACE_MODAL } from "../../types/constants";
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
            data-tip="Create Space"
            ref={ref}
            className="text-gray-600"
            onClick={() =>
              dispatch(
                showModal({
                  modalType: CREATE_BOARD_MODAL,
                  modalProps: {
                    name: 'dd'
                  },
                })
              )
            }
          >
            <HiOutlinePlus size={15} />
          </button>
          <CustomReactToolTip />
        </>
      ),
      component: <SpaceList />,
    },
  ]);

  return (
    <aside
      className={`sidebar z-20 shadow-xl fixed left-0 top-0 bottom-0 overflow-x-hidden box-border ${
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

      <main className="flex-1" id="sidebar">
        <nav className="border-b pb-3">
          <SidebarLink to="/" Icon={VscHome} text="Home" />
          <SidebarLink
            to="/notifications"
            Icon={IoNotificationsOutline}
            text="Notifications"
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
                className={`flex items-center px-2 py-3 w-full justify-between noselect hover:bg-secondary cursor-pointer`}
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
