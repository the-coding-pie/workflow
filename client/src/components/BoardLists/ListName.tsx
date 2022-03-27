import { AxiosError } from "axios";
import debounce from "debounce-promise";
import React, { useCallback, useState } from "react";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { addToast } from "../../redux/features/toastSlice";
import { BoardObj, FavoriteObj, SpaceObj } from "../../types";
import { ERROR } from "../../types/constants";

interface Props {
  listId: string;
  boardId: string;
  spaceId: string;
  initialValue: string;
}

const ListName = ({ boardId, spaceId, listId, initialValue }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [name, setName] = useState(initialValue);
  const [lastVal, setLastVal] = useState(initialValue);

  const updateName = debounce(
    (newName, boardId) =>
      axiosInstance
        .put(
          `/lists/${listId}/name`,
          {
            name: newName,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          queryClient.setQueryData(["getLists", boardId], (oldValue: any) => {
            return {
              ...oldValue,
              lists: oldValue.lists.map((l: any) => {
                if (l._id === listId) {
                  return {
                    ...l,
                    name: newName,
                  };
                }
                return l;
              }),
            };
          });
        })
        .catch((error: AxiosError) => {
          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 403:
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getLists", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getLists", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);

                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);

                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
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
        }),
    500
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(e.target.value);

    if (value !== "") {
      setLastVal(e.target.value);
      updateName(e.target.value.trim(), boardId);
    }
  };

  const handleBlur = () => {
    if (name === "") {
      setName(lastVal);
    }
  };

  return (
    <input
      className="outline-none w-full bg-transparent focus:border-2 rounded focus:border-primary px-1.5 py-1 h-7 font-semibold text-base"
      onChange={(e) => handleChange(e)}
      value={name}
      onBlur={handleBlur}
    />
  );
};

export default ListName;
