import { BoardObj, FavoriteObj, SpaceObj } from "../types";
import { BOARD, SPACE } from "../types/constants";

const favorites: FavoriteObj[] = [
  {
    _id: "1",
    name: "Google New dadfsa",
    isGuestSpace: true,
    type: SPACE,
    icon: "https://images.unsplash.com/photo-1541411438265-4cb4687110f2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    _id: "4",
    spaceId: "1",
    name: "Board 3",
    type: BOARD,
    color: "#5DBF48",
  },
];

export default favorites;
