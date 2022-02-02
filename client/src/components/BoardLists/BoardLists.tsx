import React from "react";
import List from "./List";

const BoardLists = () => {
  return (
    <div
      className="board-lists bg-green-200 absolute overflow-y-hidden overflow-x-auto top-20 left-0 right-0 bottom-0"
      style={{
        zIndex: 5,
      }}
    >
      <div className="w-full gap-x-6 h-full flex items-start">
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
        <List />
      </div>
    </div>
  );
};

export default BoardLists;
