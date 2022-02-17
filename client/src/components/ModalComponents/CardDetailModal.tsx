import React from "react";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "../../axiosInstance";
import { CardDetailObj } from "../../types";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch } from "react-redux";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR } from "../../types/constants";
import { Navigate } from "react-router-dom";
import ErrorBoardLists from "../ErrorBoardLists/ErrorBoardLists";
import ErrorCard from "../ErrorCard/ErrorCard";
import CardDetailSkeleton from "../Skeletons/CardDetailSkeleton";
import { hideModal } from "../../redux/features/modalSlice";

interface Props {
  _id: string;
  boardId: string;
  spaceId: string;
}

const CardDetailModal = ({ _id, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const getCard = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/cards/${queryKey[1]}`);

    const { data } = response.data;

    return data;
  };

  const {
    data: card,
    isLoading,
    isRefetching,
    error,
  } = useQuery<CardDetailObj | undefined, any, CardDetailObj, string[]>(
    ["getCard", _id],
    getCard
  );

  if (isLoading) {
    return <CardDetailSkeleton />;
  }

  if (error) {
    if (error?.response) {
      const response = error.response;
      const { message } = response.data;

      switch (response.status) {
        case 400:
          queryClient.invalidateQueries(["getLists", boardId]);

          dispatch(addToast({ kind: ERROR, msg: message }));
          dispatch(hideModal());
          break;
        case 404:
          queryClient.invalidateQueries(["getCard", _id]);
          queryClient.invalidateQueries(["getBoard", boardId]);
          queryClient.invalidateQueries(["getLists", boardId]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);

          queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
          queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
          queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

          dispatch(addToast({ kind: ERROR, msg: message }));
          dispatch(hideModal());
          break;
        case 500:
          return (
            <ErrorCard
              isRefetching={isRefetching}
              queryKey={["getCard", _id]}
              msg={message}
            />
          );
        default:
          return (
            <ErrorCard
              isRefetching={isRefetching}
              queryKey={["getCard", _id]}
              msg={"Oops, something went wrong!"}
            />
          );
      }
    } else if (error?.request) {
      return (
        <ErrorCard
          isRefetching={isRefetching}
          queryKey={["getCard", _id]}
          msg={"Oops, something went wrong, Unable to get response back!"}
        />
      );
    } else {
      return (
        <ErrorCard
          isRefetching={isRefetching}
          msg={`Oops, something went wrong!`}
          queryKey={["getCard", _id]}
        />
      );
    }
  }

  return <div>{_id} Card</div>;
};

export default CardDetailModal;
