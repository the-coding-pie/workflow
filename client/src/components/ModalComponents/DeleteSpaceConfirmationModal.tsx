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
    dispatch(hideModal());
  }, []);

  return (
    <div
      className="remove-space-member-confirmation-modal"
      style={{
        width: "450px",
      }}
    >
      <p className="px-4 py-2">
        The member will be removed from the space as well as from all the
        board(s) which he/she is a part of. But if he/she is the only{" "}
        <strong>admin</strong> of any board, then you will fill that space after
        removing him/her.
      </p>
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
