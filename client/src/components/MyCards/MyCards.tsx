import React from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import Masonry from "react-masonry-css";
import axiosInstance from "../../axiosInstance";
import { BoardObj, CardObj, CardObjExt } from "../../types";
import Board from "../Board/Board";
import Error from "../Error/Error";
import Loader from "../Loader/Loader";
import UtilityBtn from "../UtilityBtn/UtilityBtn";
import MyCard from "./MyCard";

const MyCards = () => {
  const queryClient = useQueryClient();

  const getAllMyCards = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/cards/all`);

    const { data } = response.data;

    return data;
  };

  const {
    data: cards,
    isLoading,
    error,
  } = useQuery<CardObjExt[] | undefined, any, CardObjExt[], string[]>(
    ["getAllMyCards"],
    getAllMyCards
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
              queryClient.invalidateQueries(["getAllMyCards"]);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="my-cards">
      <div className="my-cards-container">
        {cards && cards.length > 0 ? (
          <Masonry
            breakpointCols={{
              default: 3,
              1100: 3,
              700: 2,
              500: 1,
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {cards.map((c) => (
              <MyCard key={c._id} card={c} />
            ))}
          </Masonry>
        ) : (
          <p className="mt-4">No Cards!</p>
        )}
      </div>
    </div>
  );
};

export default MyCards;
