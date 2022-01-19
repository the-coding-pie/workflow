import React, { useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useDispatch } from "react-redux";
import useEscClose from "../../hooks/useEscClose";
import { hideModal } from "../../redux/features/modalSlice";
import { ModalObj } from "../../types";
import { CREATE_BOARD_MODAL, CREATE_SPACE_MODAL } from "../../types/constants";
import CreateBoardModal from "../ModalComponents/CreateBoardModal";
import CreateSpaceModal from "../ModalComponents/CreateSpaceModal";

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
      className="backdrop fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full overflow-y-auto overflow-x-hidden m-auto bg-black bg-opacity-60"
      style={{
        maxHeight: "100vh",
      }}
    >
      <div className="absolute top-16 flex flex-col items-center">
        <div
          className={`relative rounded modal flex flex-col`}
          style={{
            minWidth: "34rem",
            maxWidth: "70%",
            background: bgColor ? bgColor : "#ffffff",
            color: textColor ? textColor : "inherit",
          }}
          ref={ref}
        >
          {showCloseBtn === true && (
            <button
              onClick={handleClose}
              type="button"
              className="modal__close-btn absolute right-2 z-10 top-2"
            >
              <MdClose color={textColor ? textColor : "inherit"} size={21} />
            </button>
          )}
          {modalTitle && (
            <div className="modal__title">
              <h3 className="text-xl font-semibold pl-4 p-2">{modalTitle}</h3>
            </div>
          )}

          <div className={`${showCloseBtn ? "mr-4" : ""}`}>
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
