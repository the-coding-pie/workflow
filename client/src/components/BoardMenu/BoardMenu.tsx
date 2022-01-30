import React, { useEffect, useState } from "react";
import { MdChevronLeft, MdClose } from "react-icons/md";
import { BOARD_ROLES } from "../../types/constants";
import AboutMenu from "./AboutMenu";
import ChangeBgMenu from "./ChangeBgMenu";
import LabelMenu from "./LabelMenu";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  setShowMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

const BoardMenu = ({ setShowMenu, myRole }: Props) => {
  const [showOption, setShowOption] = useState(false);
  const [currentOption, setCurrentOption] = useState<string | null>(null);

  const [component, setCurrentComponent] = useState<any>(null);

  useEffect(() => {
    switch (currentOption) {
      case "About":
        setShowOption(true);
        setCurrentComponent(<AboutMenu myRole={myRole} />);
        break;
      case "ChangeBG":
        setShowOption(true);
        setCurrentComponent(<ChangeBgMenu />);
        break;
      case "Labels":
        setShowOption(true);
        setCurrentComponent(<LabelMenu />);
        break;
      default:
        setCurrentComponent(null);
    }
  }, [currentOption]);

  return (
    <div className="h-screen w-80 bg-slate-100 z-40 fixed right-0 top-14 bottom-0 overflow-x-hidden overflow-y-auto">
      <header className="px-4 py-3 flex items-center justify-between border-b mb-4">
        {showOption ? (
          <button
            className="flex-1"
            onClick={() => {
              setCurrentOption(null);
              setShowOption(false);
            }}
            type="button"
            role="close-dropdown-options"
          >
            <MdChevronLeft size={18} />
          </button>
        ) : (
          <div className="flex-1"></div>
        )}
        <div className="font-semibold text-center flex-1">Menu</div>
        <button
          onClick={() => {
            setCurrentOption(null);
            setShowOption(false);
            setShowMenu(false);
          }}
          type="button"
          role="close-dropdown-options"
          className="flex-1 flex justify-end"
        >
          <MdClose size={16} />
        </button>
      </header>

      {!showOption ? (
        <ul>
          <li>
            <button
              onClick={() => setCurrentOption("About")}
              className="w-full px-3 py-3 text-left hover:bg-slate-200"
            >
              About this board
            </button>
          </li>
          {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && (
            <li>
              <button
                onClick={() => setCurrentOption("ChangeBG")}
                className="w-full px-3 py-3 text-left hover:bg-slate-200"
              >
                Change background
              </button>
            </li>
          )}
          {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && (
            <li>
              <button
                onClick={() => setCurrentOption("Labels")}
                className="w-full px-3 py-3 text-left hover:bg-slate-200"
              >
                Labels
              </button>
            </li>
          )}

          {myRole === BOARD_ROLES.ADMIN && <li className="w-full px-3 py-3 text-left hover:bg-slate-200 text-red-500 cursor-pointer">Delete board</li>}
        </ul>
      ) : (
        <div className="option">{component && component}</div>
      )}
    </div>
  );
};

export default BoardMenu;
