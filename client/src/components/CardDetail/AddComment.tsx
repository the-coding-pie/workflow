import { AxiosError } from "axios";
import React, { useCallback, useState } from "react";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../axiosInstance";
import { RootState } from "../../redux/app";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR } from "../../types/constants";
import ProfileCard from "../Header/ProfileCard";
import Profile from "../Profile/Profile";

interface Props {
  queryKey: string[];
  cardId: string;
  boardId: string;
  spaceId: string;
}

const AddComment = ({ queryKey, cardId, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { user } = useSelector((state: RootState) => state.auth);

  const [comment, setComment] = useState("");

  const addComment = useCallback(
    (comment: string, cardId: string) => {
      // create card
      axiosInstance
        .post(
          `/cards/${cardId}/comments`,
          {
            comment,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          setComment("");

          const { data } = response.data;

          queryClient.invalidateQueries(["getAllMyCards"]);

          queryClient.setQueryData(queryKey, (oldData: any) => {
            return {
              ...oldData,
              comments: oldData.comments ? [data, ...oldData.comments] : [data],
            };
          });

          // update [getLists, id] queryCache to reflect comment + 1
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

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getCard", cardId]);
                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getLists", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);

                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
                break;
              case 400:
              case 500:
                dispatch(hideModal());
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (comment !== "") {
      addComment(comment, cardId);
    }
  };

  return (
    <form className="flex items-start mb-6" onSubmit={(e) => handleSubmit(e)}>
      <Profile
        src={user!.profile}
        alt={`${user!.username} profile`}
        classes="mr-4"
      />

      <div className="flex flex-col w-full">
        <textarea
          className="w-full shadow focus:shadow-lg focus:border outline-none p-2 rounded resize-none h-24 mb-4"
          onChange={(e) => setComment(e.target.value)}
          value={comment}
          placeholder="Write a comment"
        ></textarea>

        <button
          type="submit"
          disabled={comment === ""}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed w-20"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default AddComment;
