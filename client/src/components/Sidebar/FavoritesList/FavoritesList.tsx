import React from "react";
import favorites from "../../../data/favorites";
import { FavoriteObj } from "../../../types";
import { SPACE } from "../../../types/constants";
import FavoriteItemBoard from "./FavoriteItemBoard";
import FavoriteItemSpace from "./FavoriteItemSpace";

const FavoritesList = () => {
  return (
    <ul className="space-list pb-2">
      {favorites.length > 0 ? (
        favorites.map((fav: FavoriteObj) => {
          return fav.type === SPACE ? (
            <FavoriteItemSpace key={fav._id} item={fav} />
          ) : (
            <FavoriteItemBoard key={fav._id} item={fav} />
          );
        })
      ) : (
        <li className="px-6 text-sm py-1">Add something to favorites</li>
      )}
    </ul>
  );
};

export default FavoritesList;
