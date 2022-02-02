import React from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import Board from "../../components/Board/Board";
import Error from "../../components/Error/Error";
import Loader from "../../components/Loader/Loader";
import { addToast } from "../../redux/features/toastSlice";
import { BoardObj } from "../../types";
import { ERROR } from "../../types/constants";

interface Props {
  spaceId: string;
}

const SpaceBoards = ({ spaceId }: Props) => {
  const dispatch = useDispatch();

  const getSpaceBoards = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/spaces/${queryKey[1]}/boards`);

    const { data } = response.data;

    return data;
  };

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery<BoardObj[] | undefined, any, BoardObj[], string[]>(
    ["getSpaceBoards", spaceId],
    getSpaceBoards
  );

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // handle each error accordingly & specific to that situation
  if (error) {
    if (error?.response) {
      const response = error.response;
      const { message } = response.data;

      switch (response.status) {
        case 400:
        case 404:
          dispatch(addToast({ kind: ERROR, msg: message }));
          // redirect them to home page
          return <Navigate to="/" replace={true} />;
        case 500:
          return <Error msg={message} />;
        default:
          return <Error msg={"Oops, something went wrong."} />;
      }
    } else if (error?.request) {
      return (
        <Error
          msg={"Oops, something went wrong, Unable to get response back."}
        />
      );
    } else {
      return <Error msg={`Oops, something went wrong.`} />;
    }
  }

  return (
    <div className="space-boards px-8 py-6">
      <div className="space-container">
        {boards && boards.length > 0 ? (
          <div className="mt-6 flex items-center justify-start flex-wrap gap-x-6 gap-y-6">
            {boards.map((b) => (
              <Board key={b._id} spaceId={spaceId} board={b} />
            ))}
          </div>
        ) : (
          <p>No Boards!</p>
        )}
      </div>
    </div>
  );
};

export default SpaceBoards;
