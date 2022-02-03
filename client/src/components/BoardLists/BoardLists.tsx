import React from "react";
import List from "./List";

const BoardLists = () => {
  return (
    <div
      id="board-lists"
      className="board-lists w-full mt-4 pb-3 flex overflow-x-auto overflow-y-hidden gap-x-4"
      style={{
        zIndex: "5",
        height: "calc(100vh - 8.5rem)",
      }}
    >
      <List />
      <List />
      <List />
      <List />
      <List />
    </div>
  );
};

export default BoardLists;
