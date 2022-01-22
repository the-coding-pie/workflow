import React from "react";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "../../../axiosInstance";
import { FavoriteObj } from "../../../types";
import { SPACE } from "../../../types/constants";
import FavoriteItemBoard from "./FavoriteItemBoard";
import FavoriteItemSpace from "./FavoriteItemSpace";

const FavoritesList = () => {
  const queryClient = useQueryClient();

  const getFavorites = async () => {
    const response = await axiosInstance.get(`/favorites`);
    const { data } = response.data;

    return data;
  };

  const { data, isLoading, error } = useQuery<
    FavoriteObj[] | undefined,
    any,
    FavoriteObj[],
    string[]
  >(["getFavorites"], getFavorites);

  if (error) {
    return (
      <div
        className="w-full flex items-center justify-center text-sm"
        style={{
          height: "10rem",
        }}
      >
        <div className="flex items-center justify-center">
          <span className="mr-1">Unable to get data. </span>
          <button
            type="button"
            className="text-primary"
            onClick={() => {
              queryClient.invalidateQueries(["getFavorites"]);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{
          height: "10rem",
        }}
      >
        <svg
          className="animate-spin h-8 w-8 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="text-primary"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <ul className="favorite-list pb-2">
      {data && data.length > 0 ? (
        data.map((fav: FavoriteObj) => {
          return fav.type === SPACE ? (
            <FavoriteItemSpace key={fav._id} item={fav} />
          ) : (
            <FavoriteItemBoard key={fav._id} item={fav} />
          );
        })
      ) : (
        <li className="px-6 text-sm py-1 text-center mt-2">
          <p className=" border border-violet-600 p-1 border-dashed text-violet-600">
            Nothing here
          </p>
        </li>
      )}
    </ul>
  );
};

export default FavoritesList;
