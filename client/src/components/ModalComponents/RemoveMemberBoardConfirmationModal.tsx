import { AxiosError } from "axios";
import React, { useCallback } from "react";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR, SUCCESS } from "../../types/constants";

interface Props {
  spaceId: string;
  boardId: string;
  memberId: string;
}

const RemoveMemberBoardConfirmationModal = ({
  spaceId,
  boardId,
  memberId,
}: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const removeMember = useCallback((boardId, memberId, spaceId) => {
    dispatch(hideModal());

    axiosInstance
      .delete(`/boards/${boardId}/members/${memberId}`)
      .then((response) => {
        const { message } = response.data;

        dispatch(
          addToast({
            kind: SUCCESS,
            msg: message,
          })
        );

        queryClient.invalidateQueries(["getBoard", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
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
  }, []);

  return (
    <div
      className="remove-space-member-confirmation-modal"
      style={{
        width: "450px",
      }}
    >
      <p className="px-4 py-2">
        The member will be removed from the board as well as from all the
        card(s) which he/she is a part of.
      </p>
      <div className="buttons py-2 pb-3 flex justify-end">
        <button
          onClick={() => dispatch(hideModal())}
          className="font-medium text-slate-600 mr-4"
        >
          Cancel
        </button>
        <button
          onClick={() => removeMember(boardId, memberId, spaceId)}
          className="btn-danger"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default RemoveMemberBoardConfirmationModal;
