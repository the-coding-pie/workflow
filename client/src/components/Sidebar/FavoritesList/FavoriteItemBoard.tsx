import React, { useEffect, useState } from "react";
import { BoardObj, FavoriteObj } from "../../../types";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import { useDispatch } from "react-redux";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";
import { useRef } from "react";
import Options from "../../Options/Options";

interface Props {
  item: FavoriteObj;
}

const FavoriteItemBoard = ({ item }: Props) => {
  const dispatch = useDispatch();
  const [showIcon, setShowIcon] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });

  const [isCurrentBoard, setIsCurrentBoard] = useState(false);

  useEffect(() => {
    setShowOptions(showOptions);

    if (showOptions === false) {
      setShowIcon(false);
    }
  }, [showOptions]);

  const optionsBtnRef = useRef<any>(null);

  return (
    <li className="fav-board-item">
      <NavLink
        end
        onClick={(e) => {
          // if click is on options btn
          if (
            optionsBtnRef.current &&
            optionsBtnRef.current.contains(e.target)
          ) {
            e.preventDefault();
          } else {
            dispatch(setCurrentActiveMenu(1));
            dispatch(setCurrentActiveSpace(item._id));
          }
        }}
        to={`/b/${item._id}`}
        className={({ isActive }) => {
          setIsCurrentBoard(isActive);

          return `flex items-center justify-between px-3 pl-4 py-2 cursor-pointer relative  ${
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
              background: item.color,
            }}
          ></div>
          <span>{item.name}</span>
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

export default FavoriteItemBoard;
