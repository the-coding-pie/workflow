import { AxiosError } from "axios";
import React, { useCallback } from "react";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR, SUCCESS } from "../../types/constants";

interface Props {
  boardId: string;
  spaceId: string;
}

const DeleteBoardConfirmationModal = ({ boardId, spaceId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const deleteBoard = useCallback((boardId) => {
    axiosInstance
      .delete(`/boards/${boardId}`)
      .then((response) => {
        dispatch(hideModal());

        queryClient.invalidateQueries(["getRecentBoards"]);
        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.removeQueries(["getBoard", boardId]);
        queryClient.refetchQueries(["getLists", boardId]);
        queryClient.invalidateQueries(["getFavorites"]);
        queryClient.invalidateQueries(["getSpaces"]);
        queryClient.invalidateQueries(["getSpaceBoards", spaceId]);

        // redirect them to space boards page
        if (pathname === `/b/${boardId}`) {
          navigate(`/s/${spaceId}/boards`, { replace: true });
        }
      })
      .catch((error: AxiosError) => {
        dispatch(hideModal());

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
              queryClient.invalidateQueries(["getBoard", boardId]);
              dispatch(addToast({ kind: ERROR, msg: message }));
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
  }, [spaceId]);

  return (
    <div
      className="delete-board-confirmation-modal"
      style={{
        width: "450px",
      }}
    >
      <p className="px-4 py-2">
        All lists & cards will be deleted. There is no undo.
      </p>
      <div className="buttons py-2 pb-3 flex justify-end">
        <button
          onClick={() => dispatch(hideModal())}
          className="font-medium text-slate-600 mr-4"
        >
          Cancel
        </button>
        <button onClick={() => deleteBoard(boardId)} className="btn-danger">
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteBoardConfirmationModal;
