import { AxiosError } from "axios";
import React, { useCallback } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { hideModal, showModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { BoardLabel } from "../../types";
import { BOARD_LABEL_MODAL, BOARD_ROLES, ERROR } from "../../types/constants";
import ErrorBoardLists from "../ErrorBoardLists/ErrorBoardLists";
import Loader from "../Loader/Loader";

interface Props {
  spaceId: string;
  boardId: string;
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const LabelMenu = ({ spaceId, boardId, myRole }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const deleteLabel = useCallback(
    (boardId: string, labelId: string) => {
      axiosInstance
        .delete(`/boards/${boardId}/labels`, {
          data: {
            labelId,
          },
          headers: {
            ContentType: "application/json",
          },
        })
        .then((response) => {
          queryClient.setQueryData(
            ["getBoardLabels", boardId],
            (oldData: any) => {
              return oldData.filter((l: any) => l._id !== labelId);
            }
          );

          queryClient.invalidateQueries(["getAllMyCards"]);

          // update all card which depends on it
          queryClient.invalidateQueries(["getLists", boardId]);
          queryClient.invalidateQueries(["getAllCardLabels"]);
        })
        .catch((error: AxiosError) => {
          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 403:
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
                queryClient.invalidateQueries(["getLists", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
                break;
              case 400:
                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);

                dispatch(addToast({ kind: ERROR, msg: message }));

                dispatch(hideModal());
                break;
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

  const getBoardLabels = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/boards/${queryKey[1]}/labels`);

    const { data } = response.data;

    return data;
  };

  const { data, isLoading, isRefetching, error } = useQuery<
    BoardLabel[] | undefined,
    any,
    BoardLabel[],
    string[]
  >(["getBoardLabels", boardId], getBoardLabels);

  if (isLoading) {
    return (
      <div
        className="h-full w-full items-center justify-center flex overflow-x-auto overflow-y-hidden pr-4 absolute top-0 right-0 bottom-0 left-0"
        style={{
          zIndex: "5",
          height: "calc(100vh - 8.7rem)",
        }}
      >
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
        case 400:
        case 404:
          queryClient.invalidateQueries(["getBoard", boardId]);
          queryClient.invalidateQueries(["getLists", boardId]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);

          queryClient.invalidateQueries(["getRecentBoards"]);
          queryClient.invalidateQueries(["getAllMyCards"]);

          queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
          queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
          queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

          dispatch(addToast({ kind: ERROR, msg: message }));
          // redirect them to home page
          return <Navigate to="/" replace={true} />;
        case 500:
          return (
            <ErrorBoardLists
              isRefetching={isRefetching}
              queryKey={["getLists", boardId]}
              msg={message}
            />
          );
        default:
          return (
            <ErrorBoardLists
              isRefetching={isRefetching}
              queryKey={["getLists", boardId]}
              msg={"Oops, something went wrong!"}
            />
          );
      }
    } else if (error?.request) {
      return (
        <ErrorBoardLists
          isRefetching={isRefetching}
          queryKey={["getLists", boardId]}
          msg={"Oops, something went wrong, Unable to get response back!"}
        />
      );
    } else {
      return (
        <ErrorBoardLists
          isRefetching={isRefetching}
          msg={`Oops, something went wrong!`}
          queryKey={["getLists", boardId]}
        />
      );
    }
  }

  return (
    <div className="board-labels px-4 mb-8">
      <h3 className="font-semibold mb-4">Labels</h3>

      <div className="labels">
        {data && data.length > 0 ? (
          data
            .sort((a: any, b: any) =>
              a.pos > b.pos ? 1 : b.pos > a.pos ? -1 : 0
            )
            .map((l) => {
              return (
                <div className="flex items-center gap-x-4 w-full">
                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) ? (
                    <button
                      onClick={() => {
                        dispatch(
                          showModal({
                            modalType: BOARD_LABEL_MODAL,
                            modalProps: {
                              label: l,
                              boardId,
                              spaceId,
                            },
                          })
                        );
                      }}
                      key={l._id}
                      className="label p-2 rounded text-white text-left 
                hover:border-l-8 hover:border-slate-700 font-semibold mb-2 w-full h-9"
                      style={{
                        background: l.color,
                      }}
                    >
                      {l.name && l.name.length > 28
                        ? l.name?.slice(0, 28) + "..."
                        : l.name}
                    </button>
                  ) : (
                    <div
                      className="label p-2 rounded text-white text-left 
                  hover:border-l-8 hover:border-slate-700 font-semibold mb-2 w-full h-9"
                      key={l._id}
                      style={{
                        background: l.color,
                      }}
                    >
                      {l.name && l.name.length > 28
                        ? l.name?.slice(0, 28) + "..."
                        : l.name}
                    </div>
                  )}

                  {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && (
                    <button onClick={() => deleteLabel(boardId, l._id)}>
                      <HiOutlineTrash className="text-slate-700" size={18} />
                    </button>
                  )}
                </div>
              );
            })
        ) : (
          <div className="no-labels">No labels :(</div>
        )}
      </div>

      <div className="buttons">
        {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) && (
          <button
            className="btn-primary_light mt-6 w-full"
            onClick={() => {
              dispatch(
                showModal({
                  modalType: BOARD_LABEL_MODAL,
                  modalProps: {
                    boardId,
                  },
                })
              );
            }}
          >
            Create a new label
          </button>
        )}
      </div>
    </div>
  );
};

export default LabelMenu;
