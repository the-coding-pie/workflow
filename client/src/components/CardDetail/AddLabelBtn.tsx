import React, { useState } from "react";
import {
  HiOutlinePencil,
  HiOutlinePencilAlt,
  HiOutlineRefresh,
  HiOutlineTag,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { showModal } from "../../redux/features/modalSlice";
import { LabelObj, LabelObjCard } from "../../types";
import { BOARD_LABEL_MODAL } from "../../types/constants";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

interface Props {
  cardId: string;
  listId: string;
  boardId: string;
  spaceId: string;
}

const AddLabelBtn = ({ cardId, listId, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [show, setShow] = useState(false);

  const ref = useClose(() => setShow(false));

  const removeLabel = () => {};
  const addLabel = () => {};

  const getAllBoardLabels = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/cards/${queryKey[1]}/labels`);

    const { data } = response.data;

    return data;
  };

  const { data, isLoading, isFetching, error } = useQuery<
    LabelObjCard[] | undefined,
    any,
    LabelObjCard[],
    string[]
  >(["getAllCardLabels", cardId], getAllBoardLabels);

  let component = null;

  if (error) {
    component = (
      <p className="mt-6 ml-4 text-center flex items-center p-1">
        An error has occurred: {error.message}
        <UtilityBtn
          iconSize={16}
          classes="ml-2"
          Icon={HiOutlineRefresh}
          label="Retry"
          uniqueId="error-board-lists-retry"
          onClick={() => {
            queryClient.invalidateQueries(["getAllCardLabels", cardId]);
          }}
        />
      </p>
    );
  } else if (isLoading) {
    component = <p className="mt-6 ml-4 text-center">Loading...</p>;
  } else {
    component = (
      <div className="all-board-labels px-4">
        <div className="board-labels mb-4">
          <span className="text-sm text-slate-600 mb-2 inline-block font-semibold">
            Labels
          </span>
        </div>

        <div className="labels">
          {data && data.length > 0 ? (
            data
              .sort((a: any, b: any) =>
                a.pos > b.pos ? 1 : b.pos > a.pos ? -1 : 0
              )
              .map((l) => {
                return (
                  <div className="label flex items-center gap-x-6">
                    <button
                      onClick={() => {
                        if (l.isPresent) {
                          removeLabel();
                        } else {
                          addLabel();
                        }
                      }}
                      key={l._id}
                      className="label p-2 rounded text-white text-left 
          hover:border-l-8 hover:border-slate-700 font-semibold mb-2 w-full h-9 text-sm"
                      style={{
                        background: l.color,
                      }}
                    >
                      {l.name && l.name.length > 28
                        ? l.name?.slice(0, 28) + "..."
                        : l.name}
                    </button>

                    <div className="right-btns flex items-center gap-x-4">
                      <button
                        onClick={() =>
                          dispatch(
                            showModal({
                              modalType: BOARD_LABEL_MODAL,
                              modalProps: {
                                label: l,
                                boardId,
                                spaceId,
                              },
                            })
                          )
                        }
                      >
                        <HiOutlinePencil className="text-slate-700" size={18} />
                      </button>
                      <button onClick={() => {}}>
                        <HiOutlineTrash className="text-slate-700" size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="no-labels">No labels :(</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="add-label-btn relative">
      <button
        onClick={() => setShow((prevValue) => !prevValue)}
        className="card-detail-btn"
      >
        <HiOutlineTag size={16} className="mr-1" />
        Labels
      </button>

      {show && (
        <div
          className="bg-white rounded shadow-lg absolute top-8 left-0 z-40"
          style={{
            width: "400px",
          }}
        >
          <header className="flex items-center justify-between p-3 border-b mb-2">
            <span className="font-semibold">Labels</span>
            <button onClick={() => setShow(false)}>
              <HiOutlineX size={18} />
            </button>
          </header>

          {component && component}
        </div>
      )}
    </div>
  );
};

export default AddLabelBtn;
