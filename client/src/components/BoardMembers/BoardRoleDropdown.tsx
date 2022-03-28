import { AxiosError } from "axios";
import React, { useCallback, useState } from "react";
import { HiOutlineCheck } from "react-icons/hi";
import { MdChevronLeft, MdClose } from "react-icons/md";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../axiosInstance";
import { RootState } from "../../redux/app";
import { addToast } from "../../redux/features/toastSlice";
import { BoardMemberObj, OptionWithSub } from "../../types";
import { BOARD_ROLES, ERROR, SUCCESS } from "../../types/constants";

interface Props {
  boardId: string;
  spaceId: string;
  options: OptionWithSub[];
  isHeOnlyBoardAdmin: boolean;
  member: BoardMemberObj;
  setIsFirstScreen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowOptions: React.Dispatch<React.SetStateAction<boolean>>;
}

const BoardRoleDropdown = ({
  boardId,
  spaceId,
  options,
  member,
  isHeOnlyBoardAdmin,
  setIsFirstScreen,
  setShowOptions,
}: Props) => {
  const dispatch = useDispatch();

  const [showConfirmScreen, setShowConfirmScreen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const queryClient = useQueryClient();

  const { user } = useSelector((state: RootState) => state.auth);

  const resetOptions = useCallback(() => {
    setShowOptions(false);
    setIsFirstScreen(true);
  }, []);

  const changeRole = useCallback(
    (newRole, boardId, memberId) => {
      axiosInstance
        .put(`boards/${boardId}/members/${memberId}`, {
          newRole: newRole,
        })
        .then((response) => {
          const { message } = response.data;

          dispatch(
            addToast({
              kind: SUCCESS,
              msg: message,
            })
          );

          queryClient.invalidateQueries(["getBoard", boardId]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);

          resetOptions();
        })
        .catch((error: AxiosError) => {
          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 403:
                resetOptions();

                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                resetOptions();

                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);

                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                break;
              case 400:
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
    },
    [boardId, spaceId]
  );

  const handleChangeRole = useCallback(
    (o: OptionWithSub) => {
      // downgrading -> you ADMIN is trying to change to NORMAL/OBSERVER user
      if (
        member._id === user!._id &&
        member.role === BOARD_ROLES.ADMIN &&
        (o.value === BOARD_ROLES.NORMAL || o.value === BOARD_ROLES.OBSERVER)
      ) {
        setShowConfirmScreen(true);
      } else {
        changeRole(o.value, boardId, member._id);
      }
    },
    [boardId, member, user]
  );

  return (
    <div className="board-member-role-dropdown z-50">
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
                  resetOptions();
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
              <button
                onClick={() => {
                  changeRole(newRole, boardId, member._id);
                }}
                className="btn-slate"
              >
                Make me a {newRole} member
              </button>
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
                  resetOptions();
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
