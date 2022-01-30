import React, { useCallback, useState } from "react";
import { HiOutlineCheck } from "react-icons/hi";
import { MdChevronLeft, MdClose } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/app";
import { BoardMemberObj, OptionWithSub } from "../../types";
import { BOARD_ROLES } from "../../types/constants";

interface Props {
  options: OptionWithSub[];
  isHeOnlyBoardAdmin: boolean;
  member: BoardMemberObj;
  setIsFirstScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowOptions: React.Dispatch<React.SetStateAction<boolean>>;
}

const BoardRoleDropdown = ({
  options,
  member,
  isHeOnlyBoardAdmin,
  setIsFirstScreen,
  setShowOptions,
}: Props) => {
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);
  const [newRole, setNewRole] = useState("");

  const { user } = useSelector((state: RootState) => state.auth);

  const changeRole = useCallback(() => {}, []);

  const handleChangeRole = useCallback((o: OptionWithSub) => {
    // downgrading -> you ADMIN is trying to change to NORMAL/OBSERVER user
    if (
      member._id === user!._id &&
      member.role === BOARD_ROLES.ADMIN &&
      (o.value === BOARD_ROLES.NORMAL || o.value === BOARD_ROLES.OBSERVER)
    ) {
      setShowConfirmScreen(true);
    } else {
      //   changeRole(o.value, member._id, spaceId);
    }
  }, []);

  return (
    <div className="board-member-role-dropdown">
      {options.length > 0 ? (
        showConfirmScreen ? (
          <div className="dropdown noselect">
            <header className="border-b px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setShowConfirmScreen(false)}
                type="button"
                role="close-dropdown-options"
              >
                <MdChevronLeft size={18} />
              </button>

              <h2 className="font-medium">Remove admin privileges?</h2>

              <button
                onClick={() => {
                  setShowOptions(false);
                  setIsFirstScreen(true);
                }}
                type="button"
                role="close-dropdown-options"
              >
                <MdClose size={16} />
              </button>
            </header>

            <p className="px-4 py-3">
              By becoming a {newRole} member, you will lose all admin privileges
              such as the ability to change settings. To regain privileges, you
              will need another admin to change your role back to admin.
            </p>

            <div className="flex items-center justify-center px-4 py-3 pb-6">
              <button className="btn-slate">Make me a {newRole} member</button>
            </div>
          </div>
        ) : (
          <div className="dropdown">
            <header className="border-b px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setIsFirstScreen(true)}
                type="button"
                role="close-dropdown-options"
              >
                <MdChevronLeft size={18} />
              </button>

              <h2 className="font-medium">Change Permissions</h2>

              <button
                onClick={() => {
                  setShowOptions(false);
                  setIsFirstScreen(true);
                }}
                type="button"
                role="close-dropdown-options"
              >
                <MdClose size={16} />
              </button>
            </header>

            <div>
              {options.map((o) => (
                <button
                  onClick={() => {
                    setNewRole(o.value);
                    handleChangeRole(o);
                  }}
                  disabled={member.role === o.value || isHeOnlyBoardAdmin}
                  className={`px-4 py-3
              disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed
             hover:bg-primary_light cursor-pointer last:rounded-b
          `}
                  key={o.value}
                  role={`button change-role-to${o.value}`}
                >
                  <div className="title font-medium flex items-center mb-2">
                    <span className="mr-3">{o.label}</span>
                    {member.role === o.value && <HiOutlineCheck size={15} />}
                  </div>

                  <p className="text-left">{o.sub}</p>
                </button>
              ))}
            </div>

            {isHeOnlyBoardAdmin && (
              <footer className="text-slate-600 font-medium border-t px-4 py-3">
                You can’t change roles because there must be at least one admin.
              </footer>
            )}
          </div>
        )
      ) : (
        <div className="px-3 py-2 rounded h-8">No roles found!</div>
      )}
    </div>
  );
};

export default BoardRoleDropdown;
