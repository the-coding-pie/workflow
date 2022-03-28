import { AxiosError } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR } from "../../types/constants";
import { Lexorank } from "../../utils/lexorank";

interface Props {
  dataLength: number;
  prevPos: string | null;
  boardId: string;
  spaceId: string;
  queryKey: string[];
}

const AddAList = ({
  dataLength,
  prevPos,
  boardId,
  spaceId,
  queryKey,
}: Props) => {
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isFirst, setIsFirst] = useState(true);

  const queryClient = useQueryClient();

  const handleClose = () => {
    setIsOpen(false);
    setIsFirst(true);
  };

  const ref = useClose(() => handleClose());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      // scroll to bottom
      inputRef.current.scrollIntoView();
    }
  }, [prevPos]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (name !== "") {
      createList(name, prevPos, boardId);
    } else {
      inputRef && inputRef.current && inputRef.current.focus();
    }
  };

  const createList = useCallback(
    (name: string, prevPos: string | null, boardId: string) => {
      const lexorank = new Lexorank();

      const [newPos, ok] = prevPos ? lexorank.insert(prevPos, "") : ["a", true];

      // create list
      axiosInstance
        .post(
          `/lists`,
          {
            boardId,
            name: name,
            pos: newPos,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          setName("");
          setIsFirst(true);

          const { data } = response.data;

          queryClient.setQueryData(queryKey, (oldData: any) => {
            return {
              ...oldData,
              lists: [
                ...oldData.lists,
                {
                  _id: data._id,
                  name: data.name,
                  pos: data.pos,
                },
              ],
            };
          });

          if (data.refetch) {
            queryClient.invalidateQueries(["getLists", boardId]);
          }
        })
        .catch((error: AxiosError) => {
          setIsOpen(false);

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
    },
    [boardId, spaceId]
  );

  return (
    <div className={`add-a-list ${dataLength === 0 ? "ml-5" : "ml-0"}`}>
      {isOpen ? (
        <form
          onSubmit={handleSubmit}
          ref={ref}
          className="add-list-form bg-gray-100 flex flex-col px-2 py-3 rounded"
          style={{
            fontSize: "0.9rem",
            width: "18rem",
          }}
        >
          <input
            type="text"
            value={name}
            ref={inputRef}
            onChange={(e) => {
              if (e.target.value.length < 512) {
                setName(e.target.value);
              }
            }}
            className="bg-white p-2 rounded border-2 outline-none border-primary"
            autoFocus
            onFocus={(e) => isFirst && e.target.select()}
            onBlur={() => setIsFirst(false)}
            placeholder="Enter list title..."
          />
          <div className="bottom mt-3 flex items-center">
            <button type="submit" className="btn-primary mr-2">
              Add list
            </button>

            <button
              type="button"
              onClick={(e) => handleClose()}
              className="close-btn"
            >
              <HiOutlineX size={21} />
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`add-a-list bg-gray-100 flex items-center px-2 py-3 rounded hover:bg-gray-200`}
          style={{
            fontSize: "0.9rem",
            width: "18rem",
          }}
        >
          <HiOutlinePlus className="mr-1 text-gray-800" size={18} />
          <span> Add a List</span>
        </button>
      )}
    </div>
  );
};

export default AddAList;
