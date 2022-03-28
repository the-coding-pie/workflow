import { AxiosError } from "axios";
import { useField } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import { HiDotsHorizontal, HiOutlineCheck } from "react-icons/hi";
import { MdArrowLeft, MdChevronLeft, MdClose } from "react-icons/md";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import useEscClose from "../../hooks/useEscClose";
import { RootState } from "../../redux/app";
import { addToast } from "../../redux/features/toastSlice";
import { MemberObj, OptionWithSub } from "../../types";
import { ERROR, SPACE_ROLES, SUCCESS } from "../../types/constants";

interface Props {
  options: OptionWithSub[];
  isOnlyAdmin: boolean;
  member: MemberObj;
  spaceId: string;
  classes?: string;
}

const RoleDropDown = ({
  options = [],
  member,
  spaceId,
  classes,
  isOnlyAdmin,
}: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const ref = useClose(() => {
    setShowDropDown(false);
    setShowConfirmScreen(false);
  });

  const [currentValue, setCurrentValue] = useState<string>("");

  const [showDropDown, setShowDropDown] = useState(false);
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (options.length > 0) {
      const exists = options.find((o) => o.value === member.role);

      // if selected is given and it is also found in the given options
      if (exists) {
        setCurrentValue(exists.value);
      } else {
        setCurrentValue(options[0].value);
      }
    }
  }, [options]);

  const changeRole = useCallback(
    (
      newRole: typeof SPACE_ROLES.ADMIN | typeof SPACE_ROLES.NORMAL,
      memberId: string,
      spaceId: string
    ) => {
      axiosInstance
        .put(`/spaces/${spaceId}/members/${memberId}`, {
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
          setShowDropDown(false);

          queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
          queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
          queryClient.invalidateQueries(["getBoard"]);
          queryClient.invalidateQueries(["getRecentBoards"]);
          queryClient.invalidateQueries(["getAllMyCards"]);
        })
        .catch((error: AxiosError) => {
          setShowDropDown(false);

          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 404:
                dispatch(addToast({ kind: ERROR, msg: message }));
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);
                // redirect them to home page
                navigate("/", { replace: true });
                break;
              case 400:
              case 403:
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
    []
  );

  const handleChangeRole = useCallback(
    (o: OptionWithSub) => {
      // downgrading -> ADMIN is trying to change to NORMAL user
      if (
        member._id === user!._id &&
        member.role === SPACE_ROLES.ADMIN &&
        o.value === SPACE_ROLES.NORMAL
      ) {
        setShowConfirmScreen(true);
      } else {
        changeRole(o.value, member._id, spaceId);
      }
    },
    [spaceId, member]
  );

  return (
    <div className={`role-drop-down text-sm text-slate-600 ${classes}`}>
      {options.length > 0 ? (
        <div className="relative" ref={ref}>
          <button
            onClick={() => setShowDropDown((prevValue) => !prevValue)}
            type="button"
            role="change-role"
            className="flex items-center btn-slate"
          >
            <span className="font-medium mr-3">{currentValue}</span>
            <HiDotsHorizontal size={14} />
          </button>

          {showDropDown &&
            (showConfirmScreen ? (
              <div
                className="dropdown absolute bg-white z-20 bottom-8 right-0 shadow-lg rounded noselect"
                style={{
                  width: "360px",
                }}
              >
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
                    onClick={() => setShowDropDown(false)}
                    type="button"
                    role="close-dropdown-options"
                  >
                    <MdClose size={16} />
                  </button>
                </header>

                <p className="px-4 py-3">
                  By becoming a normal member, you will lose all admin
                  privileges such as the ability to change settings. To regain
                  privileges, you will need another admin to change your role
                  back to admin.
                </p>

                <div className="flex items-center justify-center px-4 py-3 pb-6">
                  <button
                    onClick={() => {
                      changeRole(SPACE_ROLES.NORMAL, member._id, spaceId);
                    }}
                    className="btn-slate"
                  >
                    Make me a normal member
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="dropdown absolute bg-white z-20 bottom-8 right-0 shadow-lg rounded noselect"
                style={{
                  width: "360px",
                }}
              >
                <header className="border-b px-4 py-3 flex items-center justify-between">
                  <h2 className="font-medium">Change Permissions</h2>

                  <button
                    onClick={() => setShowDropDown(false)}
                    type="button"
                    role="close-dropdown-options"
                  >
                    <MdClose size={16} />
                  </button>
                </header>

                {/* if it is you */}
                {member._id === user!._id
                  ? options.map((o) => (
                      <button
                        onClick={() => handleChangeRole(o)}
                        disabled={member.role === o.value || isOnlyAdmin}
                        className={`px-4 py-3
                        disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed
                       hover:bg-primary_light cursor-pointer
                    `}
                        key={o.value}
                        role={`button change-role-to${o.value}`}
                      >
                        <div className="title font-medium flex items-center mb-2">
                          <span className="mr-3">{o.label}</span>
                          {member.role === o.value && (
                            <HiOutlineCheck size={15} />
                          )}
                        </div>

                        <p className="text-left">{o.sub}</p>
                      </button>
                    ))
                  : options.map((o) => (
                      <button
                        onClick={() => handleChangeRole(o)}
                        disabled={member.role === o.value}
                        className={`px-4 py-3
                        disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed
                       hover:bg-primary_light cursor-pointer
                    `}
                        key={o.value}
                        role={`button change-role-to${o.value}`}
                      >
                        <div className="title font-medium flex items-center mb-2">
                          <span className="mr-3">{o.label}</span>
                          {member.role === o.value && (
                            <HiOutlineCheck size={15} />
                          )}
                        </div>

                        <p className="text-left">{o.sub}</p>
                      </button>
                    ))}

                {isOnlyAdmin && member._id === user!._id && (
                  <footer className="text-slate-600 font-medium border-t px-4 py-3">
                    You can’t change roles because there must be at least one
                    admin.
                  </footer>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="px-3 py-2 rounded bg-slate-200 w-24 h-8">
          No roles found!
        </div>
      )}
    </div>
  );
};

export default RoleDropDown;
