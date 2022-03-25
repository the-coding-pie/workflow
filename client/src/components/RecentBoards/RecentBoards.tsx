import React from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "../../axiosInstance";
import { BoardObj } from "../../types";
import Board from "../Board/Board";
import Error from "../Error/Error";
import Loader from "../Loader/Loader";
import UtilityBtn from "../UtilityBtn/UtilityBtn";
import RecentBoard from "./RecentBoard";

const RecentBoards = () => {
  const queryClient = useQueryClient();

  const getRecentBoards = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/boards/recentBoards`);

    const { data } = response.data;

    return data;
  };

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery<BoardObj[] | undefined, any, BoardObj[], string[]>(
    ["getRecentBoards"],
    getRecentBoards
  );

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // handle each error accordingly & specific to that situation
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-x-1">
          <p>Oops, something went wrong.</p>
          <UtilityBtn
            iconSize={16}
            classes="ml-2"
            Icon={HiOutlineRefresh}
            label="Retry"
            uniqueId="error-board-lists-retry"
            onClick={() => {
              queryClient.invalidateQueries(["getRecentBoards"]);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="recent-boards">
      <div className="recent-boards-container">
        {boards && boards.length > 0 ? (
          <div className="flex items-center justify-start flex-wrap gap-x-6 gap-y-6">
            {boards.map((b) => (
              <RecentBoard key={b._id} board={b} />
            ))}
          </div>
        ) : (
          <p className="mt-4">No Boards!</p>
        )}
      </div>
    </div>
  );
};

export default RecentBoards;
