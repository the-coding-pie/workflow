import React from "react";
import List from "./List";

const BoardLists = () => {
  return (
    <div className="board-lists bg-green-200 h-full flex overflow-x-auto overflow-y-hidden">
      <List />
      <List />
      <List />
      <List />
      <List />
      <List />
    </div>
  );
};

export default BoardLists;
