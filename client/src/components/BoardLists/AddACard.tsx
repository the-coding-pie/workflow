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
  prevPos: string | null;
  listId: string;
  boardId: string;
  spaceId: string;
  queryKey: string[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddACard = ({
  prevPos,
  listId,
  boardId,
  spaceId,
  queryKey,
  isOpen,
  setIsOpen,
}: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [name, setName] = useState("");

  const handleClose = () => {
    setIsOpen(false);
    setName("");
  };

  const ref = useClose(() => {
    if (name !== "") {
      return createCard(name, prevPos, listId);
    } else {
      return handleClose();
    }
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      // scroll to bottom
      inputRef.current.scrollIntoView();
    }
  }, [prevPos]);

  useEffect(() => {
    const cardName = document.getElementById("card-name");

    if (cardName) {
      cardName.style.height = cardName.scrollHeight + "px";
    }

    const handler = (e: any) => {
      if (e.type === "keydown") {
        if (e.key === "Enter") {
          e.preventDefault();

          if (name !== "") {
            createCard(name, prevPos, listId);
          }
        }
      }
    };

    if (isOpen && cardName) {
      cardName.addEventListener("keydown", handler, false);

      return () => {
        cardName.removeEventListener("keydown", handler, false);
      };
    }
  }, [isOpen, name]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (name !== "") {
      createCard(name, prevPos, listId);
    } else {
      inputRef && inputRef.current && inputRef.current.focus();
    }
  };

  const createCard = useCallback(
    (name: string, prevPos: string | null, listId: string) => {
      const lexorank = new Lexorank();

      const [newPos, ok] = prevPos ? lexorank.insert(prevPos, "") : ["a", true];

      // create card
      axiosInstance
        .post(
          `/cards`,
          {
            listId,
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
          inputRef && inputRef.current && inputRef.current.focus();

          const { data } = response.data;

          queryClient.setQueryData(queryKey, (oldData: any) => {
            return {
              ...oldData,
              cards: [
                ...oldData.cards,
                {
                  _id: data._id,
                  name: data.name,
                  pos: data.pos,
                  listId: data.listId,
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
    <form
      onSubmit={handleSubmit}
      ref={ref}
      className="w-full flex flex-col h-auto"
    >
      <textarea
        id="card-name"
        value={name}
        ref={inputRef}
        className="bg-white p-1.5 rounded border-none outline-none resize-none shadow w-full break-words overflow-x-hidden overflow-y-auto"
        onChange={(e) => {
          if (e.target.value.length < 512) {
            setName(e.target.value);
          }
        }}
        style={{
          minHeight: "74px",
          maxHeight: "162px",
        }}
        autoFocus
        placeholder="Enter a title for this card..."
      ></textarea>
      <div className="bottom mt-2 flex items-center">
        <button type="submit" className="btn-primary mr-2">
          Add card
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
  );
};

export default AddACard;
