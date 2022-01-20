import React from "react";
import { useDispatch } from "react-redux";
import { showModal } from "../../../redux/features/modalSlice";
import { BoardObj } from "../../../types";
import { CREATE_BOARD_MODAL } from "../../../types/constants";
import BoardItem from "./BoardItem";

interface Props {
  spaceId: string;
  boards: BoardObj[];
  setShowPlusIcon: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBoardOptions: React.Dispatch<React.SetStateAction<boolean>>;
}

const BoardList = ({
  spaceId,
  boards,
  setShowPlusIcon,
  setShowBoardOptions,
}: Props) => {
  const dispatch = useDispatch();

  return (
    <ul className="board-list text-sm">
      {boards.length > 0 ? (
        boards.map((b) => (
          <BoardItem
            setShowBoardOptions={setShowBoardOptions}
            setShowPlusIcon={setShowPlusIcon}
            key={b._id}
            board={{
              ...b,
              spaceId: spaceId,
            }}
          />
        ))
      ) : (
        <li className="pl-8 py-2">
          Create a{" "}
          <button
            type="button"
            onClick={() =>
              dispatch(
                showModal({
                  modalType: CREATE_BOARD_MODAL,
                  modalTitle: "Create Board",
                  modalProps: {
                    spaceId: spaceId,
                  },
                })
              )
            }
            className="underline text-violet-500 decoration-dashed outline-violet-500 underline-offset-4"
          >
            Board
          </button>{" "}
        </li>
      )}
    </ul>
  );
};

export default BoardList;
