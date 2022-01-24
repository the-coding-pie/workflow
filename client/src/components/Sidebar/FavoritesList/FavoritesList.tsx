import React from "react";
import { useQuery, useQueryClient } from "react-query";
import axiosInstance from "../../../axiosInstance";
import { FavoriteObj } from "../../../types";
import { SPACE } from "../../../types/constants";
import Loader from "../../Loader/Loader";
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
        <Loader />
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
