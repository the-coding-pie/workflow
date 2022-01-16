import React, { useRef, useState } from "react";
import { SpaceObj } from "../../../types";
import Avatar from "react-avatar";
import {
  HiChevronRight,
  HiChevronDown,
  HiOutlineDotsHorizontal,
  HiOutlinePlus,
} from "react-icons/hi";
import BoardList from "./BoardList";
import { useLocation } from "react-router-dom";
import CustomNavLink from "../../CustomNavLink/CustomNavLink";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/app";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import { MdGroup } from "react-icons/md";
import { useEffect } from "react";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";
import Options from "../../Options/Options";

interface Props {
  space: SpaceObj;
}

const SpaceItem = ({ space }: Props) => {
  const dispatch = useDispatch();
  const { currentActiveSpace } = useSelector(
    (state: RootState) => state.spaceMenu
  );

  const [showIcons, setShowIcons] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const { pathname } = useLocation();

  const [isCurrentSpace, setIsCurrentSpace] = useState(false);

  useEffect(() => {
    if (isCurrentSpace) {
      dispatch(setCurrentActiveMenu(1));
      dispatch(setCurrentActiveSpace(space._id));
    }
  }, [isCurrentSpace]);

  const ref = useRef<any>(null);
  const optionsBtnRef = useRef<any>(null);

  return (
    <li
      className={`space-item noselect ${
        isCurrentSpace ? "border-l-2  border-violet-700" : ""
      }`}
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
    >
      <div
        aria-label="clickable"
        className={`space relative px-3 py-2 w-full flex items-center justify-between cursor-pointer ${
          isCurrentSpace ? "bg-primary_light" : "hover:bg-secondary"
        }`}
        onClick={(e) => {
          // if options menu is closed, and click is not on options menu btn
          if (
            optionsBtnRef.current &&
            !optionsBtnRef.current.contains(e.target) &&
            showOptions === false
          ) {
            // when click, if it is in link, open it for the first time
            // no toggle
            // if it is not on link and not on options btn
            if (ref.current && !ref.current.contains(e.target)) {
              // toggling
              dispatch(
                setCurrentActiveSpace(
                  currentActiveSpace === space._id ? null : space._id
                )
              );
            } else {
              // if it is on link or on path, open it only once, no toggling
              // if links are not same, ie only on path change
              if (
                ![
                  `/s/${space._id}/boards`,
                  `/s/${space._id}/members`,
                  `/s/${space._id}/settings`,
                ].includes(pathname)
              ) {
                dispatch(setCurrentActiveSpace(space._id));
              }
            }
          }
        }}
      >
        {isCurrentSpace && (
          <span className="absolute inset-y-0 left-0 w-1 bg-violet-500 rounded-tr-xl rounded-br-xl"></span>
        )}
        <div className="left flex items-center">
          <div className="down-icon mr-1 text-gray-600">
            {currentActiveSpace === space._id ? (
              <HiChevronDown size={16} />
            ) : (
              <HiChevronRight size={16} />
            )}
          </div>
          <div className="name flex items-center">
            {space.icon ? (
              <Avatar
                src={space.icon}
                alt="space icon"
                className="rounded mr-1.5"
                size="18"
                textSizeRatio={1.75}
              />
            ) : (
              <Avatar
                name={space.name}
                className="rounded mr-1.5"
                size="18"
                textSizeRatio={1.75}
              />
            )}
            <div ref={ref}>
              {space.name.length > 10 ? (
                <CustomNavLink
                  to={`/s/${space._id}/boards`}
                  fn={setIsCurrentSpace}
                  list={[
                    `/s/${space._id}/boards`,
                    `/s/${space._id}/members`,
                    `/s/${space._id}/settings`,
                  ]}
                >
                  {space.name.slice(0, 10) + "..."}
                </CustomNavLink>
              ) : (
                <CustomNavLink
                  to={`/s/${space._id}/boards`}
                  fn={setIsCurrentSpace}
                  list={[
                    `/s/${space._id}/boards`,
                    `/s/${space._id}/members`,
                    `/s/${space._id}/settings`,
                  ]}
                >
                  {space.name}
                </CustomNavLink>
              )}
            </div>
          </div>
        </div>
        <div className="right text-gray-600 flex items-center">
          <>
            <button
              ref={optionsBtnRef}
              data-tip="Space settings"
              onClick={() => {
                setShowOptions((prevValue) => !prevValue);
              }}
              className={`mr-1 ${
                showIcons || showOptions ? "block" : "hidden"
              }`}
            >
              <HiOutlineDotsHorizontal size={16} />
            </button>
            <CustomReactToolTip />

            {(showIcons || showOptions) && !space.isGuestSpace && (
              <>
                <button data-tip="Add Board">
                  <HiOutlinePlus size={16} />
                </button>
                <CustomReactToolTip />
              </>
            )}
          </>

          {space.isGuestSpace && (
            <div className="icon text-slate-600">
              <MdGroup
                data-tip="Guest Space"
                className="outline-none"
                size={18}
              />

              <CustomReactToolTip />
            </div>
          )}
        </div>
      </div>
      <div
        className={`${currentActiveSpace === space._id ? "block" : "hidden"}`}
      >
        <BoardList boards={space.boards} />
      </div>

      <ul
        className={`options ${
          showOptions ? "absolute" : "hidden"
        } bg-white rounded shadow-lg -bottom-0 -left-4`}
        style={{
          minWidth: "150px",
        }}
      >
        <li className="p-2 hover:bg-slate-400 rounded-t">Option 1</li>
        <li className="p-2 hover:bg-slate-400">Option 1</li>
        <li className="p-2 hover:bg-slate-400">Option 1</li>
        <li className="p-2 hover:bg-slate-400 rounded-b">Option 1</li>
        <li className="p-2 hover:bg-slate-400 rounded-b">Option 1</li>
        <li className="p-2 hover:bg-slate-400 rounded-b">Option 1</li>
        <li className="p-2 hover:bg-slate-400 rounded-b">Option 1</li>
        <li className="p-2 hover:bg-slate-400 rounded-b">Option 1</li>
        <li className="p-2 hover:bg-slate-400 rounded-b">Option 1</li>
      </ul>
    </li>
  );
};

export default SpaceItem;
