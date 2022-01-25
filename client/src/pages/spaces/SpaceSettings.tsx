import React from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { addToast } from "../../redux/features/toastSlice";
import { SPACE_ROLES, WARNING } from "../../types/constants";

interface Props {
  spaceId: string;
  myRole:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
}

const SpaceSettings = ({ spaceId, myRole }: Props) => {
  const dispatch = useDispatch();

  if (myRole !== SPACE_ROLES.ADMIN && myRole !== SPACE_ROLES.NORMAL) {
    dispatch(
      addToast({
        kind: WARNING,
        msg: "You don't have permission to access.",
      })
    );
    return <Navigate to={`/s/${spaceId}/`} />;
  }

  return <div>Settings</div>;
};

export default SpaceSettings;
