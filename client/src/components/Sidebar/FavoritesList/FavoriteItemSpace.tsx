import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { FavoriteObj } from "../../../types";
import Avatar from "react-avatar";
import {
  HiOutlineDotsHorizontal,
  HiOutlinePlus,
  HiOutlineStar,
} from "react-icons/hi";
import CustomNavLink from "../../CustomNavLink/CustomNavLink";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import { MdGroup } from "react-icons/md";
import { useEffect } from "react";
import CustomReactToolTip from "../../CustomReactToolTip/CustomReactToolTip";
import Options from "../../Options/Options";
import { SPACE_ROLES } from "../../../types/constants";
import OptionsItem from "../../Options/OptionsItem";

interface Props {
  item: FavoriteObj;
}

const FavoriteItemSpace = ({ item }: Props) => {
  const dispatch = useDispatch();

  const [showIcon, setShowIcon] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const [lastCoords, setLastCoords] = useState({ x: 0, y: 0 });

  const [isCurrentSpace, setIsCurrentSpace] = useState(false);

  useEffect(() => {
    setShowOptions(showOptions);

    if (showOptions === false) {
      setShowIcon(false);
    }
  }, [showOptions]);

  const optionsBtnRef = useRef<any>(null);

  return (
    <li
      className="fav-space-item noselect"
      onMouseEnter={() => setShowIcon(true)}
      onMouseOver={() => setShowIcon(true)}
      onMouseLeave={() => !showOptions && setShowIcon(false)}
    >
      <CustomNavLink
        showUnderline={false}
        to={`/s/${item._id}/boards`}
        fn={setIsCurrentSpace}
        list={[
          `/s/${item._id}/boards`,
          `/s/${item._id}/members`,
          `/s/${item._id}/settings`,
        ]}
        onClick={(e: any) => {
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
      >
        <div
          className={`space px-3 pl-4 relative py-2 w-full flex items-center justify-between cursor-pointer ${
            isCurrentSpace ? "bg-primary_light" : "hover:bg-secondary"
          }`}
        >
          {isCurrentSpace && (
            <span className="absolute inset-y-0 left-0 w-1 bg-violet-500 rounded-tr-xl rounded-br-xl"></span>
          )}
          <div className="left flex items-center">
            <div className="name flex items-center">
              {item.icon ? (
                <Avatar
                  src={item.icon}
                  alt="space icon"
                  className="rounded mr-1.5"
                  size="18"
                  textSizeRatio={1.75}
                />
              ) : (
                <Avatar
                  name={item.name}
                  className="rounded mr-1.5"
                  size="18"
                  textSizeRatio={1.75}
                />
              )}
              <div>
                {item.name.length > 10 ? (
                  <span>{item.name.slice(0, 10) + "..."}</span>
                ) : (
                  <span>{item.name}</span>
                )}
              </div>
            </div>
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
              data-tip="Space settings"
              className={`mr-1 ${showIcon ? "block" : "hidden"}`}
            >
              <HiOutlineDotsHorizontal size={16} />
            </button>
            <CustomReactToolTip />

            {item.role === SPACE_ROLES.GUEST && (
              <div className="icon text-slate-600">
                <MdGroup data-tip="Guest Space" size={18} />

                <CustomReactToolTip />
              </div>
            )}
          </div>
        </div>
      </CustomNavLink>

      <Options
        show={showOptions}
        setShow={setShowOptions}
        x={lastCoords.x}
        y={lastCoords.y}
      >
        <OptionsItem
          key="Unfavorite"
          Icon={HiOutlineStar}
          text="Unfavorite"
          onClick={() => {}}
          iconFillColor="#fbbf24"
          iconColor="#fbbf24"
        />
      </Options>
    </li>
  );
};

export default FavoriteItemSpace;
