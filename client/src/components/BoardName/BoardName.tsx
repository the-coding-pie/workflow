import { AxiosError } from "axios";
import debounce from "debounce-promise";
import React, { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { addToast } from "../../redux/features/toastSlice";
import { BoardObj, FavoriteObj, SpaceObj } from "../../types";
import { ERROR } from "../../types/constants";

interface Props {
  spaceId: string;
  boardId: string;
  initialValue: string;
}

const BoardName = ({ boardId, spaceId, initialValue }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [lastVal, setLastVal] = useState("");

  useEffect(() => {
    setName(initialValue);
    setLastVal(initialValue);
  }, [boardId]);

  const updateName = debounce((newName, boardId) => {
    if (newName !== "") {
      axiosInstance
        .put(
          `/boards/${boardId}/name`,
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
          queryClient.invalidateQueries(["getRecentBoards"]);

          // manually edit name in four parts -> sidebar(2), spaceBoards, getBoard
          // getBoards, boardId
          queryClient.setQueryData(["getBoard", boardId], (oldValue: any) => {
            return {
              ...oldValue,
              name: newName,
            };
          });

          // sidebar
          if (queryClient.getQueryData(["getSpaces"])) {
            queryClient.setQueryData(["getSpaces"], (oldData: any) => {
              return oldData.map((d: SpaceObj) => {
                return {
                  ...d,
                  boards: d.boards.map((b: BoardObj) => {
                    if (b._id === boardId) {
                      return {
                        ...b,
                        name: newName,
                      };
                    }

                    return b;
                  }),
                };
              });
            });
          }

          // sidebar favorite
          if (queryClient.getQueryData(["getFavorites"])) {
            queryClient.setQueryData(["getFavorites"], (oldData: any) => {
              return oldData.map((item: FavoriteObj) => {
                if (item.resourceId === boardId) {
                  return {
                    ...item,
                    name: newName,
                  };
                }

                return item;
              });
            });
          }

          if (queryClient.getQueryData(["getSpaceBoards", spaceId])) {
            queryClient.setQueryData(
              ["getSpaceBoards", spaceId],
              (oldData: any) => {
                return oldData.map((b: BoardObj) => {
                  if (b._id === boardId) {
                    return {
                      ...b,
                      name: newName,
                    };
                  }

                  return b;
                });
              }
            );
          }
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

                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);

                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);

                navigate(`/s/${spaceId}`, { replace: true });
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
    }
  }, 500);

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
      className="border-none outline-none max-w-max bg-slate-50 shadow rounded px-2 py-1.5"
      onChange={(e) => handleChange(e)}
      value={name}
      onBlur={handleBlur}
    />
  );
};

export default BoardName;
