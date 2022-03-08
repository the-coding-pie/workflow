import React from "react";
import { HiOutlineTrash } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { showModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { BoardLabel } from "../../types";
import { BOARD_LABEL_MODAL, BOARD_ROLES, ERROR } from "../../types/constants";
import ErrorBoardLists from "../ErrorBoardLists/ErrorBoardLists";
import Loader from "../Loader/Loader";

interface Props {
  spaceId: string;
  boardId: string;
}

const LabelMenu = ({ spaceId, boardId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

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
    <div className="board-labels px-4">
      <h3 className="font-semibold mb-4">Labels</h3>

      <div className="labels">
        {data && data.length > 0 ? (
          data.sort().map((l) => {
            return (
              <div className="flex items-center gap-x-4 w-full">
                <button
                  onClick={() => {
                    dispatch(
                      showModal({
                        modalType: BOARD_LABEL_MODAL,
                        modalProps: {
                          label: l,
                        },
                      })
                    );
                  }}
                  key={l._id}
                  className="label p-2 rounded text-white text-left 
                hover:border-l-8 hover:border-slate-700 font-semibold mb-2 w-full"
                  style={{
                    background: l.color,
                  }}
                >
                  {l.name}
                </button>

                <button>
                  <HiOutlineTrash className="text-slate-700" size={18} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="no-labels">No labels :(</div>
        )}
      </div>

      <div className="buttons">
        <button
          className="btn-primary_light mt-6 w-full"
          onClick={() => {
            dispatch(
              showModal({
                modalType: BOARD_LABEL_MODAL,
              })
            );
          }}
        >
          Create a new label
        </button>
      </div>
    </div>
  );
};

export default LabelMenu;
