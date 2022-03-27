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
  memberId: string;
}

const DeleteSpaceConfirmationModal = ({ spaceId, memberId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const deleteSpace = useCallback((spaceId) => {
    axiosInstance
      .delete(`/spaces/${spaceId}`)
      .then((response) => {
        dispatch(hideModal());

        queryClient.invalidateQueries(["getFavorites"]);
        queryClient.invalidateQueries(["getSpaces"]);

        queryClient.removeQueries(["getSpaceInfo", spaceId]);
        queryClient.removeQueries(["getSpaceBoards", spaceId]);
        queryClient.invalidateQueries(["getRecentBoards"]);
        queryClient.invalidateQueries(["getAllMyCards"]);
        queryClient.removeQueries(["getSpaceSettings", spaceId]);
        queryClient.removeQueries(["getSpaceMembers", spaceId]);

        // redirect them to space boards page
        navigate(`/`, { replace: true });
      })
      .catch((error: AxiosError) => {
        dispatch(hideModal());

        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);

              queryClient.invalidateQueries(["getRecentBoards"]);
              queryClient.invalidateQueries(["getAllMyCards"]);

              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
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
  }, []);

  return (
    <div
      className="delete-space-confirmation-modal"
      style={{
        width: "450px",
      }}
    >
      <p className="px-4 py-2">This is permanent and can't be undone.</p>
      <div className="buttons py-2 pb-3 flex justify-end">
        <button
          onClick={() => dispatch(hideModal())}
          className="font-medium text-slate-600 mr-4"
        >
          Cancel
        </button>
        <button onClick={() => deleteSpace(spaceId)} className="btn-danger">
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteSpaceConfirmationModal;
