import React from "react";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import Error from "../../components/Error/Error";
import Loader from "../../components/Loader/Loader";
import Profile from "../../components/Profile/Profile";
import SpaceMember from "../../components/SpaceMember/SpaceMember";
import { RootState } from "../../redux/app";
import { showModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { MemberObj } from "../../types";
import {
  ERROR,
  INVITE_SPACE_MEMBER_MODAL,
  SPACE_ROLES,
  WARNING,
} from "../../types/constants";

interface Props {
  spaceId: string;
  myRole:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
}

const SpaceMembers = ({ spaceId, myRole }: Props) => {
  const dispatch = useDispatch();

  if (myRole !== SPACE_ROLES.ADMIN && myRole !== SPACE_ROLES.NORMAL) {
    dispatch(
      addToast({
        kind: WARNING,
        msg: "You don't have permission to access.",
      })
    );
    return <Navigate to={`/s/${spaceId}/`} replace={true} />;
  }

  // if you reached here, then you must be an ADMIN or a NORMAL
  const getSpaceMembers = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/spaces/${queryKey[1]}/members`);

    const { data } = response.data;

    return data;
  };

  const {
    data: members,
    isLoading,
    error,
  } = useQuery<MemberObj[] | undefined, any, MemberObj[], string[]>(
    ["getSpaceMembers", spaceId],
    getSpaceMembers
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // handle each error accordingly & specific to that situation
  if (error) {
    if (error?.response) {
      const response = error.response;
      const { message } = response.data;

      switch (response.status) {
        case 403:
          dispatch(addToast({ kind: ERROR, msg: message }));
          // redirect them to home page
          return <Navigate to={`/s/${spaceId}/`} replace={true} />;
        case 400:
        case 404:
          dispatch(addToast({ kind: ERROR, msg: message }));
          // redirect them to home page
          return <Navigate to="/" replace={true} />;
        case 500:
          return <Error msg={message} />;
        default:
          return <Error msg={"Oops, something went wrong."} />;
      }
    } else if (error?.request) {
      return (
        <Error
          msg={"Oops, something went wrong, Unable to get response back."}
        />
      );
    } else {
      return <Error msg={`Oops, something went wrong.`} />;
    }
  }

  return (
    <div className="space-members px-8 py-6 mt-2">
      <div className="space-container">
        {members && members.length > 0 ? (
          <div className="members">
            <div
              className={`intro ${
                myRole === SPACE_ROLES.ADMIN ? "mb-4" : "mb-8"
              }`}
            >
              <h3 className="text-xl font-semibold">Members & Guests</h3>
              <p className="text-slate-600">
                A list of all the space members and guests.
              </p>
            </div>
            {myRole === SPACE_ROLES.ADMIN && (
              <div className="flex justify-end w-full mb-6">
                <button
                  onClick={() =>
                    dispatch(
                      showModal({
                        modalType: INVITE_SPACE_MEMBER_MODAL,
                        modalProps: {
                          spaceId: spaceId,
                        },
                      })
                    )
                  }
                  className="btn-primary text-sm"
                >
                  Invite Space Members
                </button>
              </div>
            )}
            <div className="bg-white border">
              {members.map((m) => (
                <SpaceMember
                  key={m._id}
                  isOnlyAdmin={
                    myRole === SPACE_ROLES.ADMIN &&
                    members.filter((m) => m.role === SPACE_ROLES.ADMIN)
                      .length === 1
                  }
                  myRole={myRole}
                  spaceId={spaceId}
                  member={m}
                />
              ))}
            </div>
          </div>
        ) : (
          <p>No Members!</p>
        )}
      </div>
    </div>
  );
};

export default SpaceMembers;
