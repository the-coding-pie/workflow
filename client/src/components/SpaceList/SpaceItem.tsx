import React, { useRef, useState } from "react";
import { SpaceObj } from "../../types";
import Avatar from "react-avatar";
import {
  HiChevronRight,
  HiChevronDown,
  HiOutlineDotsHorizontal,
  HiOutlinePlus,
} from "react-icons/hi";
import BoardList from "./BoardList";
import { useLocation } from "react-router-dom";
import CustomNavLink from "../CustomNavLink/CustomNavLink";

interface Props {
  space: SpaceObj;
  currentActive: string | null;
  setCurrentActive: React.Dispatch<React.SetStateAction<string | null>>;
}

const SpaceItem = ({ space, setCurrentActive, currentActive }: Props) => {
  const [showIcons, setShowIcons] = useState(false);

  const { pathname } = useLocation();

  const [isCurrentSpace, setIsCurrentSpace] = useState(false);

  const ref = useRef<any>(null);

  return (
    <li
      className="space-item noselect "
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
    >
      <div
        className={`space px-2 relative py-2 w-full flex items-center justify-between cursor-pointer ${
          isCurrentSpace ? "bg-primary_light" : "hover:bg-secondary"
        }`}
        onClick={(e) => {
          // when click, if it is in link, open it for the first time
          // no toggle
          // if it is not on link
          if (ref.current && !ref.current.contains(e.target)) {
            // toggling
            setCurrentActive((prevValue) => {
              if (prevValue === space._id) {
                return null;
              }
              return space._id;
            });
          } else {
            // if it is on link, open it only once, no toggling
            // if links are not same
            if (
              ![
                `/s/${space._id}/boards`,
                `/s/${space._id}/members`,
                `/s/${space._id}/settings`,
              ].includes(pathname)
            ) {
              setCurrentActive(space._id);
            }
          }
        }}
      >
        {isCurrentSpace && (
          <span className="absolute inset-y-0 left-0 w-1 bg-violet-500 rounded-tr-xl rounded-br-xl"></span>
        )}
        <div className="left flex items-center">
          <div className="down-icon mr-1 text-gray-600">
            {currentActive === space._id ? (
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
        {showIcons && (
          <div className="right text-gray-600 flex items-center">
            <button className="mr-1">
              <HiOutlineDotsHorizontal size={16} />
            </button>
            <button>
              <HiOutlinePlus size={16} />
            </button>
          </div>
        )}
      </div>
      {currentActive === space._id && <BoardList boards={space.boards} />}
    </li>
  );
};

export default SpaceItem;
