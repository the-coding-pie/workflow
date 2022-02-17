import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { showModal } from "../../redux/features/modalSlice";
import { CardObj } from "../../types";
import { BOARD_ROLES, CARD_DETAIL_MODAL } from "../../types/constants";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
  card: CardObj;
  index: number;
  boardId: string;
  spaceId: string;
}

const Card = ({ myRole, card, index, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();

  return (
    <Draggable
      isDragDisabled={![BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole)}
      draggableId={card._id}
      index={index}
    >
      {(provided, snapshot) => (
        <li
          onClick={() =>
            dispatch(
              showModal({
                modalType: CARD_DETAIL_MODAL,
                modalProps: {
                  _id: card._id,
                  boardId: boardId,
                  spaceId,
                },
              })
            )
          }
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white mb-2 rounded p-2 shadow hover:bg-slate-100 cursor-pointer font-normal text-gray-900"
        >
          {card.name.length > 100 ? card.name.slice(0, 100) + "..." : card.name}
        </li>
      )}
    </Draggable>
  );
};

export default Card;
