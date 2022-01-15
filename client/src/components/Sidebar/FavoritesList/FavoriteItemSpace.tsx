import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { FavoriteObj } from "../../../types";
import Avatar from "react-avatar";
import { HiOutlineDotsHorizontal, HiOutlinePlus } from "react-icons/hi";
import CustomNavLink from "../../CustomNavLink/CustomNavLink";
import { setCurrentActiveSpace } from "../../../redux/features/spaceMenu";
import { setCurrentActiveMenu } from "../../../redux/features/sidebarMenu";
import { MdGroup } from "react-icons/md";
import ReactTooltip from "react-tooltip";

interface Props {
  item: FavoriteObj;
}

const FavoriteItemSpace = ({ item }: Props) => {
  const dispatch = useDispatch();

  const [showIcons, setShowIcons] = useState(false);
  const [isCurrentSpace, setIsCurrentSpace] = useState(false);

  return (
    <li
      className="fav-space-item noselect"
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
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
        onClick={() => {
          dispatch(setCurrentActiveMenu(1));
          dispatch(setCurrentActiveSpace(item._id));
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
            {showIcons && (
              <>
                <button className="mr-1">
                  <HiOutlineDotsHorizontal size={16} />
                </button>
                {!item.isGuestSpace && (
                  <button>
                    <HiOutlinePlus size={16} />
                  </button>
                )}
              </>
            )}
            {item.isGuestSpace && (
              <div className="icon text-slate-600">
                <MdGroup data-tip="Guest Space" size={18} />

                <ReactTooltip place="bottom" />
              </div>
            )}
          </div>
        </div>
      </CustomNavLink>
    </li>
  );
};

export default FavoriteItemSpace;
