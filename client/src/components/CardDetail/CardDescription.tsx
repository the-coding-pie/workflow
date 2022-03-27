import { AxiosError } from "axios";
import debounce from "debounce-promise";
import React, { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR } from "../../types/constants";

interface Props {
  initialValue: string;
  spaceId: string;
  boardId: string;
  cardId: string;
  showDescEdit: boolean;
  setShowDescEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

const CardDescription = ({
  initialValue,
  spaceId,
  boardId,
  cardId,
  showDescEdit,
  setShowDescEdit,
}: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [isFirst, setIsFirst] = useState(true);
  const [description, setDescription] = useState(initialValue);

  const updateDescription = debounce(
    (newDescription, cardId) =>
      axiosInstance
        .put(
          `/cards/${cardId}/description`,
          {
            description: newDescription,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          setShowDescEdit(false);

          queryClient.invalidateQueries(["getAllMyCards"]);

          queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
            return {
              ...oldValue,
              description: newDescription,
            };
          });

          queryClient.invalidateQueries(["getLists", boardId]);
        })
        .catch((error: AxiosError) => {
          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 403:
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getCard", cardId]);
                queryClient.invalidateQueries(["getBoard", boardId]);

                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);

                queryClient.invalidateQueries(["getCard", cardId]);
                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getLists", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);

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
        }),
    500
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    setDescription(value);
  };

  return (
    <>
      <textarea
        className="outline-none w-full bg-transparent border-2 border-transparent focus:border-2 rounded focus:border-primary px-1.5 py-1 resize-none"
        autoFocus
        onBlur={() => setIsFirst(false)}
        onFocus={(e) => isFirst && e.target.select()}
        style={{
          height: "170px",
        }}
        onChange={(e) => handleChange(e)}
        value={description}
      ></textarea>

      <div className="buttons flex items-center py-2">
        <button
          onClick={(e) => {
            updateDescription(description.trim(), cardId);
          }}
          className="btn-primary mr-2"
        >
          Save
        </button>
        <button
          onClick={() => {
            setShowDescEdit(false);
            setIsFirst(true);
          }}
        >
          <HiOutlineX size={21} />
        </button>
      </div>
    </>
  );
};

export default CardDescription;
