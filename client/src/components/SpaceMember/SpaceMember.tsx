import React from "react";
import { MemberObj } from "../../types";
import { SPACE_ROLES } from "../../types/constants";
import Profile from "../Profile/Profile";

interface Props {
  member: MemberObj;
  myRole:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
}

const SpaceMember = ({ member, myRole }: Props) => {
  return (
    <div className="member w-full flex justify-between border-b first:border-t py-4">
      <div className="left flex items-center">
        <Profile
          isAdmin={member.role === SPACE_ROLES.ADMIN}
          src={member.profile}
        />
        <span className="username pl-3 font-semibold text-slate-700">
          {member.username}
        </span>
      </div>
    </div>
  );
};

export default SpaceMember;
