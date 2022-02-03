import React from "react";
import { HiOutlinePlus } from "react-icons/hi";
import { BOARD_ROLES } from "../../types/constants";
import List from "./List";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const BoardLists = ({ myRole }: Props) => {
  return (
    <div
      id="board-lists"
      className="board-lists w-full mt-4 flex items-start overflow-x-auto overflow-y-hidden gap-x-4 pr-4"
      style={{
        zIndex: "5",
        height: "calc(100vh - 8.7rem)",
      }}
    >
      <List myRole={myRole} />
      <List myRole={myRole} />
      <List myRole={myRole} />
      <List myRole={myRole} />
      <List myRole={myRole} />

      <button
        className="add-a-list bg-gray-100 flex items-center px-2 py-3 rounded hover:bg-gray-200"
        style={{
          fontSize: "0.9rem",
          minWidth: "18rem",
        }}
      >
        <HiOutlinePlus className="mr-1 text-gray-800" size={18} />
        <span> Add a List</span>
      </button>
    </div>
  );
};

export default BoardLists;
