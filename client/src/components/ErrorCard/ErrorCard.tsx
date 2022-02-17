import React from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { useQueryClient } from "react-query";
import CardDetailSkeleton from "../Skeletons/CardDetailSkeleton";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

interface Props {
  msg: string;
  isRefetching: boolean;
  queryKey: string[];
}

const ErrorCard = ({ msg, isRefetching, queryKey }: Props) => {
  const queryClient = useQueryClient();

  return (
    <div
      className="error-board-lists h-full w-full items-center justify-center flex overflow-x-auto overflow-y-hidden pr-4"
      style={{
        minWidth: "600px",
        minHeight: "420px",
      }}
    >
      {isRefetching ? (
        <CardDetailSkeleton />
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

export default ErrorCard;
