import React, { useRef, useState } from "react";
import { SpaceObj } from "../../../types";
import Avatar from "react-avatar";
import {
  HiChevronRight,
  HiChevronDown,
  HiOutlineDotsHorizontal,
  HiOutlinePlus,
  HiOutlineStar,
  HiOutlineShare,
  HiPencilAlt,
  HiOutlineTrash,
  HiCog,
  HiOutlineCog,
  HiOutlinePencil,
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
import OptionsItem from "../../Options/OptionsItem";
import { SPACE_ROLES } from "../../../types/constants";

interface Props {
  space: SpaceObj;
}

const SpaceItem = ({ space }: Props) => {
  const dispatch = useDispatch();
  const { currentActiveSpace } = useSelector(
    (state: RootState) => state.spaceMenu
  );

  const [showIcon, setShowIcon] = useState(false);
  const [showPlusIcon, setShowPlusIcon] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showBoardOptions, setShowBoardOptions] = useState(false);

  const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });

  const { pathname } = useLocation();

  const [isCurrentSpace, setIsCurrentSpace] = useState(false);

  useEffect(() => {
    if (isCurrentSpace) {
      dispatch(setCurrentActiveMenu(1));
      dispatch(setCurrentActiveSpace(space._id));
    }
  }, [isCurrentSpace]);

  useEffect(() => {
    if (showOptions === false) {
      setShowIcon(false);
    }
  }, [showOptions]);

  const ref = useRef<any>(null);
  const optionsBtnRef = useRef<any>(null);

  return (
    <li
      className={`space-item noselect`}
      onMouseOver={() => {
        !showOptions && !showBoardOptions && setShowPlusIcon(true);
      }}
      onMouseEnter={() =>
        !showOptions && !showBoardOptions && setShowPlusIcon(true)
      }
      onMouseLeave={() => {
        setShowPlusIcon(false);
      }}
    >
      <div
        onMouseOver={() => {
          setShowIcon(true);
        }}
        onMouseEnter={() => setShowIcon(true)}
        onMouseLeave={() => !showOptions && setShowIcon(false)}
        aria-label="clickable"
        className={`space relative px-3 py-2 w-full flex items-center justify-between cursor-pointer ${
          isCurrentSpace ? "bg-primary_light" : "hover:bg-secondary"
        }`}
        onClick={(e) => {
          // if options menu is closed, and click is not on options menu btn
          if (
            optionsBtnRef.current &&
            !optionsBtnRef.current.contains(e.target)
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
              onClick={({ nativeEvent }) => {
                setLastCoords({
                  x: nativeEvent.pageX,
                  y: nativeEvent.pageY,
                });
                setShowOptions(true);
                setShowPlusIcon(false);
                setShowIcon(true);
              }}
              className={`mr-1 ${showIcon ? "block" : "hidden"}`}
            >
              <HiOutlineDotsHorizontal size={16} />
            </button>
            <CustomReactToolTip />

            <button
              className={`${
                showPlusIcon && space.role !== SPACE_ROLES.GUEST
                  ? "block"
                  : "hidden"
              }`}
              data-tip="Add Board"
            >
              <HiOutlinePlus size={16} />
            </button>
            <CustomReactToolTip />
          </>

          {space.role === SPACE_ROLES.GUEST && (
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
        <BoardList
          setShowBoardOptions={setShowBoardOptions}
          setShowPlusIcon={setShowPlusIcon}
          boards={space.boards}
        />
      </div>

      <Options
        show={showOptions}
        setShow={setShowOptions}
        x={lastCoords.x}
        y={lastCoords.y}
      >
        {space.role === SPACE_ROLES.GUEST ? (
          <>
            {space.isFavorite ? (
              <OptionsItem
                key="Unfavorite"
                Icon={HiOutlineStar}
                text="Unfavorite"
                onClick={() => {}}
                iconFillColor="#fbbf24"
                iconColor="#fbbf24"
              />
            ) : (
              <OptionsItem
                key="Favorite"
                Icon={HiOutlineStar}
                text="Favorite"
                onClick={() => {}}
              />
            )}
          </>
        ) : (
          <>
            <OptionsItem
              key="Add Board"
              Icon={HiOutlinePlus}
              text="Add Board"
              onClick={() => {}}
            />
            {space.isFavorite ? (
              <OptionsItem
                key="Unfavorite"
                Icon={HiOutlineStar}
                text="Unfavorite"
                onClick={() => {}}
                iconFillColor="#fbbf24"
                iconColor="#fbbf24"
              />
            ) : (
              <OptionsItem
                key="Favorite"
                Icon={HiOutlineStar}
                text="Favorite"
                onClick={() => {}}
              />
            )}
            {space.role === SPACE_ROLES.ADMIN && (
              <OptionsItem
                key="Invite"
                Icon={HiOutlineShare}
                text="Invite"
                onClick={() => {}}
              />
            )}
            {space.role === SPACE_ROLES.ADMIN && (
              <OptionsItem
                key="Rename"
                Icon={HiOutlinePencil}
                text="Rename"
                onClick={() => {}}
              />
            )}
            {space.role === SPACE_ROLES.ADMIN && (
              <OptionsItem
                key="Delete"
                Icon={HiOutlineTrash}
                text="Delete"
                iconColor="#f87171"
                textColor="#f87171"
                onClick={() => {}}
              />
            )}

            <OptionsItem
              key="Settings"
              Icon={HiOutlineCog}
              text="Settings"
              onClick={() => {}}
            />
          </>
        )}
      </Options>
    </li>
  );
};

export default SpaceItem;
