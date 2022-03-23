import React, { useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useDispatch } from "react-redux";
import useEscClose from "../../hooks/useEscClose";
import { hideModal } from "../../redux/features/modalSlice";
import { ModalObj } from "../../types";
import {
  BOARD_LABEL_MODAL,
  CARD_DETAIL_MODAL,
  CONFIRM_DELETE_BOARD_MODAL,
  CONFIRM_DELETE_SPACE_MODAL,
  CONFIRM_LEAVE_BOARD_MODAL,
  CONFIRM_LEAVE_SPACE_MODAL,
  CONFIRM_REMOVE_BOARD_MEMBER_MODAL,
  CONFIRM_REMOVE_SPACE_MEMBER_MODAL,
  CREATE_BOARD_MODAL,
  CREATE_SPACE_MODAL,
  INVITE_SPACE_MEMBER_MODAL,
} from "../../types/constants";
import CreateBoardModal from "../ModalComponents/CreateBoardModal";
import CreateSpaceModal from "../ModalComponents/CreateSpaceModal";
import InviteSpaceMemberModal from "../ModalComponents/InviteSpaceMemberModal";
import RemoveMemberSpaceConfirmationModal from "../ModalComponents/RemoveMemberSpaceConfirmationModal";
import LeaveSpaceConfirmationModal from "../ModalComponents/LeaveSpaceConfirmationModal";
import DeleteSpaceConfirmationModal from "../ModalComponents/DeleteSpaceConfirmationModal";
import LeaveBoardConfirmationModal from "../ModalComponents/LeaveBoardConfirmationModal";
import RemoveMemberBoardConfirmationModal from "../ModalComponents/RemoveMemberBoardConfirmationModal";
import CardDetailModal from "../ModalComponents/CardDetailModal";
import BoardLabelModal from "../ModalComponents/BoardLabelModal";
import DeleteBoardConfirmationModal from "../ModalComponents/DeleteBoardConfirmationModal";

interface Props extends ModalObj {}

const Modal = ({
  modalType,
  modalProps,
  modalTitle,
  showCloseBtn,
  bgColor,
  textColor,
}: Props) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideModal());
  };

  const ref = useEscClose(() => handleClose());

  let Component: React.FC<any> | null = null;

  switch (modalType) {
    case CREATE_SPACE_MODAL:
      Component = CreateSpaceModal;
      break;
    case CREATE_BOARD_MODAL:
      Component = CreateBoardModal;
      break;
    case INVITE_SPACE_MEMBER_MODAL:
      Component = InviteSpaceMemberModal;
      break;
    case CONFIRM_LEAVE_SPACE_MODAL:
      Component = LeaveSpaceConfirmationModal;
      break;
    case CONFIRM_REMOVE_SPACE_MEMBER_MODAL:
      Component = RemoveMemberSpaceConfirmationModal;
      break;
    case CONFIRM_DELETE_SPACE_MODAL:
      Component = DeleteSpaceConfirmationModal;
      break;
    case CONFIRM_DELETE_BOARD_MODAL:
      Component = DeleteBoardConfirmationModal;
      break;
    case CONFIRM_LEAVE_BOARD_MODAL:
      Component = LeaveBoardConfirmationModal;
      break;
    case CONFIRM_REMOVE_BOARD_MEMBER_MODAL:
      Component = RemoveMemberBoardConfirmationModal;
      break;
    case CARD_DETAIL_MODAL:
      Component = CardDetailModal;
      break;
    case BOARD_LABEL_MODAL:
      Component = BoardLabelModal;
      break;
    default:
      Component = null;
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflowX = "hidden";
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <div
      className="backdrop fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full overflow-y-auto overflow-x-auto m-auto bg-black bg-opacity-60"
      style={{
        maxHeight: "100vh",
      }}
    >
      <div className="absolute top-16 flex flex-col items-center">
        <div
          className={`relative rounded modal flex flex-col`}
          style={{
            maxWidth: "60rem",
            background: bgColor ? bgColor : "#ffffff",
            color: textColor ? textColor : "inherit",
          }}
          ref={ref}
        >
          {showCloseBtn === true && (
            <button
              onClick={handleClose}
              type="button"
              className="modal__close-btn absolute right-2 bg-white bg-opacity-50 rounded-full p-1 z-10 top-2"
            >
              <MdClose color={textColor ? textColor : "inherit"} size={21} />
            </button>
          )}
          {modalTitle && (
            <div className="modal__title">
              <h3 className="text-xl font-semibold pl-4 p-2">{modalTitle}</h3>
            </div>
          )}

          <div className={`w-full ${showCloseBtn ? "mr-4" : ""}`}>
            {/* desctucturing undefinded value inside object, it will ignore */}

            {Component !== null && <Component {...modalProps} />}
          </div>
        </div>
        <div className="empty-space pb-14"></div>
      </div>
    </div>
  );
};

export default Modal;
