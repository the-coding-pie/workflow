import { AxiosError } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { HiOutlineCheck } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { addToast } from "../../redux/features/toastSlice";
import { OptionWithSub } from "../../types";
import { BOARD_VISIBILITY_TYPES, ERROR, SUCCESS } from "../../types/constants";

interface Props {
  spaceId: string;
  boardId: string;
  options: OptionWithSub[];
  visibility?:
    | typeof BOARD_VISIBILITY_TYPES.PRIVATE
    | typeof BOARD_VISIBILITY_TYPES.PUBLIC;
}

const BoardVisibilityDropdown = ({
  spaceId,
  boardId,
  options = [],
  visibility,
}: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [currentValue, setCurrentValue] = useState("");

  const [showDropDown, setShowDropDown] = useState(false);

  const ref = useClose(() => {
    setShowDropDown(false);
  });

  useEffect(() => {
    if (options.length > 0) {
      const exists = options.find((o) => o.value === visibility);

      // if selected is given and it is also found in the given options
      if (exists) {
        setCurrentValue(exists.value);
      } else {
        setCurrentValue(options[0].value);
      }
    }
  }, [options]);

  const handleVisibilityChange = useCallback(
    (
      newVisibility:
        | typeof BOARD_VISIBILITY_TYPES.PRIVATE
        | typeof BOARD_VISIBILITY_TYPES.PUBLIC,
      boardId: string
    ) => {
      axiosInstance
        .put(
          `/boards/${boardId}/visibility`,
          {
            newVisibility,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          setShowDropDown(false);

          queryClient.invalidateQueries(["getRecentBoards"]);

          queryClient.invalidateQueries(["getBoard", boardId]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);

          queryClient.invalidateQueries(["getRecentBoards"]);
          queryClient.invalidateQueries(["getAllMyCards"]);

          queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
          queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
          queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
        })
        .catch((error: AxiosError) => {
          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 403:
                setShowDropDown(false);

                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getLists", boardId]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                setShowDropDown(false);

                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getLists", boardId]);
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
    [spaceId]
  );

  return (
    <div
      className="board-visibility-dropdown text-sm text-slate-600 relative"
      ref={ref}
    >
      <button
        onClick={(e) => setShowDropDown((prevValue) => !prevValue)}
        className="current-visibility rounded bg-stone-50 px-2 py-1.5"
      >
        <span>{currentValue}</span>
      </button>

      {showDropDown && (
        <div
          className="dropdown absolute bg-white z-40 top-10 left-0 shadow-lg rounded noselect"
          style={{
            width: "360px",
          }}
        >
          <header className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="font-medium">Change visibility</h2>

            <button
              onClick={() => setShowDropDown(false)}
              type="button"
              role="close-dropdown-options"
            >
              <MdClose size={16} />
            </button>
          </header>

          <div className="options">
            {options.map((o) => (
              <button
                onClick={() => handleVisibilityChange(o.value, boardId)}
                disabled={o.value === currentValue}
                className={`px-4 py-3
                        disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed
                       hover:bg-primary_light cursor-pointer rounded-0 last:rounded-b
                    `}
                key={o.value}
                role={`button change-role-to${o.value}`}
              >
                <div className="title font-medium flex items-center mb-2">
                  <span className="mr-3">{o.label}</span>
                  {currentValue === o.value && <HiOutlineCheck size={15} />}
                </div>

                <p className="text-left">{o.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardVisibilityDropdown;
