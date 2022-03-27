import { AxiosError } from "axios";
import { format } from "date-fns";
import React, { useState } from "react";
import { HiOutlineClock, HiOutlineX } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR } from "../../types/constants";

interface Props {
  dueDate: string | null;
  cardId: string;
  listId: string;
  boardId: string;
  spaceId: string;
}

const DueDateBtn = ({ dueDate, cardId, listId, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [date, setDate] = useState(
    (dueDate && new Date(dueDate).toISOString().substring(0, 10)) || ""
  );
  const [show, setShow] = useState(false);

  const ref = useClose(() => setShow(false));

  const addDueDate = (dueDate: string) => {
    axiosInstance
      .put(
        `/cards/${cardId}/dueDate`,
        { dueDate: dueDate },
        {
          headers: {
            ContentType: "application/json",
          },
        }
      )
      .then((response) => {
        const { data } = response.data;

        setShow(false);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            dueDate: data,
          };
        });

        queryClient.invalidateQueries(["getAllMyCards"]);

        // update in getLists query Cache
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              setShow(false);
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              setShow(false);
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
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
              queryClient.invalidateQueries(["getCard", cardId]);
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
  };

  const removeDueDate = () => {
    axiosInstance
      .delete(`/cards/${cardId}/dueDate`)
      .then((response) => {
        setDate("");

        queryClient.invalidateQueries(["getAllMyCards"]);

        setShow(false);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          delete oldValue.dueDate;

          return oldValue;
        });

        // update in getLists query Cache
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              setShow(false);
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              setShow(false);
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
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
              queryClient.invalidateQueries(["getCard", cardId]);
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
  };

  return (
    <div ref={ref} className="due-date-btn relative">
      <button
        onClick={() => setShow((prevValue) => !prevValue)}
        className="card-detail-btn"
      >
        <HiOutlineClock size={16} className="mr-1" />
        Due date
      </button>

      {show && (
        <div
          className="bg-white rounded shadow-lg absolute top-8 left-0 z-40"
          style={{
            width: "350px",
          }}
        >
          <header className="flex items-center justify-between p-3 border-b mb-2">
            <span className="font-semibold">Due Date</span>
            <button onClick={() => setShow(false)}>
              <HiOutlineX size={18} />
            </button>
          </header>

          <div className="px-4 mt-4">
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              className="outline-none cursor-pointer border border-primary_light rounded p-0.5"
            />
          </div>

          <div className="buttons text-sm mt-6 flex flex-col px-4 gap-y-4 mb-4">
            <button
              onClick={() => addDueDate(date!)}
              disabled={!date}
              className="btn-primary"
            >
              Save
            </button>
            <button
              disabled={!dueDate}
              className="btn-gray"
              onClick={() => removeDueDate()}
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueDateBtn;
