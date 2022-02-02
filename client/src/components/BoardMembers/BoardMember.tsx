import React, { useState } from "react";
import { MdClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import useClose from "../../hooks/useClose";
import { RootState } from "../../redux/app";
import { showModal } from "../../redux/features/modalSlice";
import { BoardMemberObj } from "../../types";
import {
  BOARD_ROLES,
  CONFIRM_LEAVE_BOARD_MODAL,
  CONFIRM_REMOVE_BOARD_MEMBER_MODAL,
} from "../../types/constants";
import Profile from "../Profile/Profile";
import BoardRoleDropdown from "./BoardRoleDropdown";

interface Props {
  spaceId: string;
  boardId: string;
  member: BoardMemberObj;
  boardAdmins: BoardMemberObj[];
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const BoardMember = ({
  spaceId,
  boardId,
  member,
  boardAdmins,
  myRole,
}: Props) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.auth);

  const rolesOptions = [
    {
      value: BOARD_ROLES.ADMIN,
      label: BOARD_ROLES.ADMIN,
      sub: "Can view and edit cards, remove members, and change all settings for the board",
    },
    {
      value: BOARD_ROLES.NORMAL,
      label: BOARD_ROLES.NORMAL,
      sub: "Can view and edit cards. Can change some board settings.",
    },
    {
      value: BOARD_ROLES.OBSERVER,
      label: BOARD_ROLES.OBSERVER,
      sub: "Can view cards, and can be allowed to comment. Can't move or edit cards, or change settings.",
    },
  ];

  const [showOptions, setShowOptions] = useState(false);
  const [isFirstScreen, setIsFirstScreen] = useState(true);

  const isBoardAdmin = boardAdmins.find((bm: any) => bm._id === member._id)
    ? true
    : false;
  const isHeOnlyBoardAdmin = isBoardAdmin && boardAdmins.length === 1;

  const isMeOnlyAdmin =
    boardAdmins.find((bm: any) => bm._id == user!._id) &&
    boardAdmins.length === 1;

  const ref = useClose(() => {
    setShowOptions(false);
    setIsFirstScreen(true);
  });

  return (
    <div className="board-member relative" ref={ref}>
      <Profile
        classes="w-7 h-7 cursor-pointer"
        isAdmin={isBoardAdmin}
        src={member.profile}
        onClick={() => setShowOptions((prevValue) => !prevValue)}
      />

      {showOptions && (
        <div
          className="board-member-dropdown absolute bg-white z-40 top-10 left-0 shadow-lg rounded noselect text-sm text-slate-600"
          style={{
            width: "320px",
          }}
        >
          {isFirstScreen ? (
            <div className="first-screen">
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
                  <Profile
                    classes="w-12 h-12 border mr-4"
                    src={member.profile}
                  />

                  <span className="text-base font-semibold">
                    {member.username}
                  </span>
                </div>
              </header>
              <ul className="first-options text-sm">
                {member._id === user!._id ? (
                  <li>
                    <button
                      onClick={() => {
                        setShowOptions(false);
                        dispatch(
                          showModal({
                            modalType: CONFIRM_LEAVE_BOARD_MODAL,
                            modalProps: {
                              spaceId,
                              boardId,
                            },
                            modalTitle: "Are you sure want to leave the board?",
                          })
                        );
                      }}
                      disabled={isMeOnlyAdmin}
                      className="disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white hover:bg-slate-200 w-full text-left px-3 py-1.5"
                    >
                      Leave board
                    </button>
                  </li>
                ) : (
                  myRole === BOARD_ROLES.ADMIN && (
                    <li>
                      <button
                        onClick={() => {
                          setShowOptions(false);
                          dispatch(
                            showModal({
                              modalType: CONFIRM_REMOVE_BOARD_MEMBER_MODAL,
                              modalProps: {
                                spaceId,
                                boardId,
                                memberId: member._id,
                              },
                              modalTitle:
                                "Are you sure want to remove board member?",
                            })
                          );
                        }}
                        className="disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white hover:bg-slate-200 w-full text-left px-3 py-1.5"
                      >
                        Remove from board
                      </button>
                    </li>
                  )
                )}
                <li className="mb-4">
                  <button
                    onClick={() => setIsFirstScreen(false)}
                    className={`disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-white hover:bg-slate-200 w-full text-left px-3 py-1.5`}
                    disabled={
                      member.isSpaceAdmin || myRole !== BOARD_ROLES.ADMIN
                    }
                  >
                    Change Permissions... ({member.role})
                  </button>
                </li>
              </ul>

              {isMeOnlyAdmin && member._id === user!._id && (
                <footer className="border-t  pt-1 px-3 pb-4">
                  You can't leave the board, because there must be atleast one
                  admin in the board.
                </footer>
              )}
            </div>
          ) : (
            <BoardRoleDropdown
              boardId={boardId}
              options={rolesOptions}
              setIsFirstScreen={setIsFirstScreen}
              setShowOptions={setShowOptions}
              isHeOnlyBoardAdmin={isHeOnlyBoardAdmin}
              member={member}
              spaceId={spaceId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BoardMember;
