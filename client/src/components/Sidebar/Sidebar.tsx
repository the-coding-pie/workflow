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
import { CREATE_SPACE_MODAL } from "../../types/constants";
import FavoritesList from "./FavoritesList/FavoritesList";
import { useRef } from "react";
import { RootState } from "../../redux/app";
import { setCurrentActiveMenu } from "../../redux/features/sidebarMenu";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { currentActiveMenu } = useSelector(
    (state: RootState) => state.sidebarMenu
  );

  const ref = useRef<any>(null);

  const [menu, setMenu] = useState([
    {
      id: 0,
      fn: null,
      name: "Favorites",
      component: <FavoritesList />,
    },
    {
      id: 1,
      name: "Spaces",
      fn: () =>
        dispatch(
          showModal({
            modalType: CREATE_SPACE_MODAL,
          })
        ),
      component: <SpaceList />,
    },
  ]);

  return (
    <aside
      className={`sidebar border-r w-60 bg-white h-screen flex flex-col transition ease-in-out delay-75`}
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

      <ul className="text-sm">
        {menu.map((m) => (
          <li
            className={`border-b ${
              currentActiveMenu === m.id ? "text-gray-800" : "text-gray-500 "
            }`}
          >
            <button
              onClick={(e) => {
                // if the click is on plus btn
                if (ref.current) {
                  if (ref.current && !ref.current.contains(e.target)) {
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
              {m.fn && (
                <button
                  ref={ref}
                  className="text-gray-600"
                  onClick={() => m.fn()}
                >
                  <HiOutlinePlus size={15} />
                </button>
              )}
            </button>
            {currentActiveMenu === m.id && (
              <div className="content">{m.component}</div>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
