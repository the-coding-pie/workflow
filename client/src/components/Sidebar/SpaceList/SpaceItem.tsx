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

interface Props {
  space: SpaceObj;
}

const SpaceItem = ({ space }: Props) => {
  const dispatch = useDispatch();
  const { currentActiveSpace } = useSelector(
    (state: RootState) => state.spaceMenu
  );

  const [showIcons, setShowIcons] = useState(false);

  const { pathname } = useLocation();

  const [isCurrentSpace, setIsCurrentSpace] = useState(false);

  useEffect(() => {
    if (isCurrentSpace) {
      dispatch(setCurrentActiveMenu(1));
      dispatch(setCurrentActiveSpace(space._id));
    }
  }, [isCurrentSpace]);

  const ref = useRef<any>(null);

  return (
    <li
      className="space-item noselect"
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
    >
      <div
        aria-label="clickable"
        className={`space px-3 relative py-2 w-full flex items-center justify-between cursor-pointer ${
          isCurrentSpace ? "bg-primary_light" : "hover:bg-secondary"
        }`}
        onClick={(e) => {
          // when click, if it is in link, open it for the first time
          // no toggle
          // if it is not on link
          if (ref.current && !ref.current.contains(e.target)) {
            // toggling
            dispatch(
              setCurrentActiveSpace(
                currentActiveSpace === space._id ? null : space._id
              )
            );
          } else {
            // if it is on link, open it only once, no toggling
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
          {showIcons && (
            <>
              <button data-tip="Space settings" className="mr-1">
                <HiOutlineDotsHorizontal size={16} />
              </button>
              <CustomReactToolTip />

              {!space.isGuestSpace && (
                <>
                  <button data-tip="Add Board">
                    <HiOutlinePlus size={16} />
                  </button>
                  <CustomReactToolTip />
                </>
              )}
            </>
          )}
          {space.isGuestSpace && (
            <div className="icon text-slate-600">
              <MdGroup data-tip="Guest Space" size={18} />

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
    </li>
  );
};

export default SpaceItem;
