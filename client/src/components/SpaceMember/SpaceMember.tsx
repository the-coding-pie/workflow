import React from "react";
import { HiUserGroup } from "react-icons/hi";
import { MdGroup } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/app";
import { MemberObj } from "../../types";
import { SPACE_ROLES } from "../../types/constants";
import Profile from "../Profile/Profile";
import UtilityBtn from "../UtilityBtn/UtilityBtn";
import RoleDropDown from "./RoleDropdown";

interface Props {
  member: MemberObj;
  myRole:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
  isOnlyAdmin: boolean;
  spaceId: string;
}

const SpaceMember = ({ member, myRole, spaceId, isOnlyAdmin }: Props) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const rolesOptions = [
    {
      value: SPACE_ROLES.ADMIN,
      label: SPACE_ROLES.ADMIN,
      sub: "Can view, create and edit Space boards, and change settings for the Space. Will have admin rights on all boards in this Space.",
    },
    {
      value: SPACE_ROLES.NORMAL,
      label: SPACE_ROLES.NORMAL,
      sub: "Can view, create, and edit Space boards, but not change settings.",
    },
  ];

  return (
    <div className="member w-full flex items-center justify-between border-b last:border-b-0 py-4 px-4">
      <div className="left flex flex-1 items-center">
        <Profile
          isAdmin={member.role === SPACE_ROLES.ADMIN}
          src={member.profile}
        />
        <span className="username pl-3 font-semibold text-slate-700">
          {member.username}
        </span>
      </div>

      <div className="right flex flex-1 justify-end items-center">
        {member.role === SPACE_ROLES.GUEST ? (
          <>
            <div className="member-role">
              <div className="text-sm font-medium text-slate-600">
                {member.role}
              </div>
            </div>
            <div className="action btn">
              {myRole === SPACE_ROLES.ADMIN && (
                <button className="ml-6 btn-slate text-sm">Add to Space</button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="member-role">
              {myRole === SPACE_ROLES.ADMIN ? (
                <RoleDropDown
                  isOnlyAdmin={isOnlyAdmin}
                  member={member}
                  options={rolesOptions}
                  spaceId={spaceId}
                />
              ) : (
                <div className="text-sm font-medium text-slate-600">
                  {member.role}
                </div>
              )}
            </div>
            <div className="action-btn">
              {user!._id === member._id ? (
                <button
                  className="ml-6 btn-slate text-sm"
                  disabled={isOnlyAdmin}
                >
                  Leave
                </button>
              ) : (
                myRole === SPACE_ROLES.ADMIN && (
                  <button className="ml-6 btn-slate text-sm">Remove</button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpaceMember;
