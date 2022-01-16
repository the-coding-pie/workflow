import React, { useRef, useState } from "react";
import { BoardObj } from "../../../types";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import { RootState } from "../../../redux/app";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";
import Options from "../../Options/Options";

interface Props {
  board: BoardObj;
}

const BoardItem = ({ board }: Props) => {
  const dispatch = useDispatch();
  const [showIcons, setShowIcons] = useState(false);

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
    if (showOptions === true) {
      setShowIcons(false);
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
        onMouseOver={() => setShowIcons(true)}
        onMouseEnter={() => setShowIcons(true)}
        onMouseLeave={() => setShowIcons(false)}
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
              if (showOptions === false) {
                setLastCoords({
                  x: nativeEvent.pageX,
                  y: nativeEvent.pageY,
                });
              }
              setShowOptions((prevValue) => !prevValue);
            }}
            ref={optionsBtnRef}
            data-tip="Board settings"
            className={`mr-1 ${showIcons ? "block" : "hidden"}`}
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
        <ul
          className={`options block bg-white rounded shadow-lg top-0 -left-4`}
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
      </Options>
    </li>
  );
};

export default BoardItem;
