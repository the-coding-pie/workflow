import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";
import useClose from "../../hooks/useClose";
import { RootState } from "../../redux/app";
import { BoardMemberObj } from "../../types";
import { BOARD_ROLES } from "../../types/constants";
import Profile from "../Profile/Profile";

interface Props {
  member: BoardMemberObj;
  boardAdmins: BoardMemberObj[];
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const BoardMember = ({ member, boardAdmins, myRole }: Props) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [showOptions, setShowOptions] = useState(false);

  const isMeOnlyAdmin =
    boardAdmins.length === 1 && boardAdmins[0]._id === user!._id;
  const isBoardAdmin = boardAdmins.find((bm: any) => bm._id === member._id)
    ? true
    : false;

  const ref = useClose(() => {
    setShowOptions(false);
  });

  return (
    <div className="board-member relative" ref={ref}>
      <Profile
        classes="w-7.5 h-7.5 cursor-pointer"
        isAdmin={isBoardAdmin}
        src={member.profile}
        onClick={() => setShowOptions((prevValue) => !prevValue)}
      />

      {showOptions && (
        <div
          className="board-member-dropdown absolute bg-white z-20 top-10 left-0 shadow-lg rounded noselect"
          style={{
            width: "300px",
          }}
        >
          <header className="px-4 py-3 bg-primary_light rounded-t border-b mb-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowOptions(false)}
                type="button"
                role="close-dropdown-options"
              >
                <MdClose size={16} />
              </button>
            </div>
            <div className="info flex items-center ">
              <Profile classes="w-12 h-12 border mr-4" src={member.profile} />

              <span className="text-lg font-semibold">{member.username}</span>
            </div>
          </header>

          <ul className="options">
            {user!._id === member._id ? (
              isMeOnlyAdmin ? (
                <li className={`px-3 py-1.5 cursor-not-allowed text-slate-400`}>
                  Leave board
                </li>
              ) : (
                <li className={`px-3 py-1.5 cursor-pointer`}>Leave board</li>
              )
            ) : (
              myRole === BOARD_ROLES.ADMIN &&
              isBoardAdmin &&
              boardAdmins.length !== 1 && (
                <li className="px-3 py-1.5 cursor-pointer">
                  Remove from board
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BoardMember;
