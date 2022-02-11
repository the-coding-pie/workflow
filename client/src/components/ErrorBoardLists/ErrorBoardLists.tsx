import React from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { useQueryClient } from "react-query";
import Loader from "../Loader/Loader";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

interface Props {
  msg: string;
  isRefetching: boolean;
  queryKey: string[];
}

const ErrorBoardLists = ({ msg, isRefetching, queryKey }: Props) => {
  const queryClient = useQueryClient();

  return (
    <div
      className="error-board-lists h-full w-full items-center justify-center flex overflow-x-auto overflow-y-hidden pr-4 absolute top-0 right-0 bottom-0 left-0"
      style={{
        zIndex: "5",
        height: "calc(100vh - 8.7rem)",
      }}
    >
      {isRefetching ? (
        <Loader />
      ) : (
        <div className="flex items-center ">
          <span className="text-base mr-2">{msg}</span>
          <UtilityBtn
            iconSize={16}
            Icon={HiOutlineRefresh}
            label="Retry"
            uniqueId="error-board-lists-retry"
            onClick={() => {
              queryClient.invalidateQueries(queryKey);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ErrorBoardLists;
