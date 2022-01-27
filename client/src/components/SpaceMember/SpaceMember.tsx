import { AxiosError } from "axios";
import React, { useCallback } from "react";
import { HiUserGroup } from "react-icons/hi";
import { MdGroup } from "react-icons/md";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { RootState } from "../../redux/app";
import { showModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { MemberObj } from "../../types";
import {
  CONFIRM_LEAVE_SPACE_MODAL,
  CONFIRM_REMOVE_SPACE_MEMBER_MODAL,
  ERROR,
  SPACE_ROLES,
  SUCCESS,
} from "../../types/constants";
import Profile from "../Profile/Profile";
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
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const navigate = useNavigate();

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

  const addToSpace = useCallback((spaceId, memberId) => {
    axiosInstance
      .put(`/spaces/${spaceId}/members`, {
        memberId: memberId,
      })
      .then((response) => {
        const { message } = response.data;

        dispatch(
          addToast({
            kind: SUCCESS,
            msg: message,
          })
        );

        queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 404:
              dispatch(addToast({ kind: ERROR, msg: message }));
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              // redirect them to home page
              navigate("/", { replace: true });
              break;
            case 400:
            case 403:
            case 409:
            case 500:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
              break;
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }
      });
  }, []);

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
                <button
                  onClick={() => addToSpace(spaceId, member._id)}
                  className="ml-6 btn-slate text-sm"
                >
                  Add to Space
                </button>
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
                  onClick={() =>
                    dispatch(
                      showModal({
                        modalType: CONFIRM_LEAVE_SPACE_MODAL,
                        modalProps: {
                          spaceId: spaceId,
                        },
                        modalTitle: "Are you sure want to Leave?",
                      })
                    )
                  }
                  className="ml-6 btn-slate text-sm"
                  disabled={isOnlyAdmin}
                >
                  Leave
                </button>
              ) : (
                myRole === SPACE_ROLES.ADMIN && (
                  <button
                    onClick={() =>
                      dispatch(
                        showModal({
                          modalType: CONFIRM_REMOVE_SPACE_MEMBER_MODAL,
                          modalProps: {
                            spaceId: spaceId,
                            memberId: member._id,
                          },
                          modalTitle: "Are you sure want to remove member?",
                        })
                      )
                    }
                    className="ml-6 btn-slate text-sm"
                  >
                    Remove
                  </button>
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
