import React, { useRef, useState } from "react";
import { BoardObj } from "../../../types";
import {
  HiOutlineCog,
  HiOutlineDotsHorizontal,
  HiOutlinePencil,
  HiOutlineShare,
  HiOutlineStar,
  HiOutlineTrash,
} from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";
import Options from "../../Options/Options";
import OptionsItem from "../../Options/OptionsItem";
import { BOARD_ROLES } from "../../../types/constants";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";

interface Props {
  board: BoardObj;
  setShowPlusIcon: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBoardOptions: React.Dispatch<React.SetStateAction<boolean>>;
}

const BoardItem = ({ board, setShowPlusIcon, setShowBoardOptions }: Props) => {
  const dispatch = useDispatch();

  const [showIcon, setShowIcon] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });

  const [isCurrentBoard, setIsCurrentBoard] = useState(false);

  useEffect(() => {
    if (isCurrentBoard) {
      dispatch(setCurrentActiveMenu(1));
      dispatch(setCurrentActiveSpace(board.spaceId));
    }
  }, [isCurrentBoard]);

  useEffect(() => {
    setShowBoardOptions(showOptions);

    if (showOptions === false) {
      setShowIcon(false);
    }
  }, [showOptions]);

  const optionsBtnRef = useRef<any>(null);

  return (
    <li className="board-item">
      <NavLink
        onClick={(e) => {
          // if click is on options btn
          if (
            optionsBtnRef.current &&
            optionsBtnRef.current.contains(e.target)
          ) {
            e.preventDefault();
          }
        }}
        end
        to={`/b/${board._id}`}
        className={({ isActive }) => {
          setIsCurrentBoard(isActive);

          return `flex items-center justify-between pl-8 pr-4 py-1 cursor-pointer relative  ${
            isActive ? "bg-primary_light" : "hover:bg-secondary"
          }`;
        }}
        onMouseOver={() => setShowIcon(true)}
        onMouseEnter={() => setShowIcon(true)}
        onMouseLeave={() => !showOptions && setShowIcon(false)}
      >
        {isCurrentBoard && (
          <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-tr-xl rounded-br-xl"></span>
        )}
        <div className="left flex items-center">
          <div
            className={`color mr-2 w-2 h-2 rounded-full`}
            style={{
              background: board.color,
            }}
          ></div>
          <span>{board.name}</span>
        </div>

        <div className="right text-gray-600 flex items-center">
          <button
            onClick={({ nativeEvent }) => {
              setLastCoords({
                x: nativeEvent.pageX,
                y: nativeEvent.pageY,
              });
              setShowOptions(true);
              setShowIcon(true);
              setShowPlusIcon(false);
            }}
            ref={optionsBtnRef}
            data-tip="Board settings"
            className={`mr-1 ${showIcon ? "block" : "hidden"}`}
          >
            <HiOutlineDotsHorizontal size={16} />
          </button>
          <CustomReactToolTip />
        </div>
      </NavLink>

      <Options
        show={showOptions}
        setShow={setShowOptions}
        x={lastCoords.x}
        y={lastCoords.y}
      >
        {board.role === BOARD_ROLES.VIEWER ? (
          <>
            {board.isFavorite ? (
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
            {board.isFavorite ? (
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

            <OptionsItem
              key="Invite"
              Icon={HiOutlineShare}
              text="Invite"
              onClick={() => {}}
            />

            {board.role === BOARD_ROLES.ADMIN && (
              <OptionsItem
                key="Rename"
                Icon={HiOutlinePencil}
                text="Rename"
                onClick={() => {}}
              />
            )}
            {board.role === BOARD_ROLES.ADMIN && (
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

export default BoardItem;
