import React from "react";
import List from "./List";

const BoardLists = () => {
  return (
    <div className="board-lists flex box-border overflow-y-hidden overflow-x-auto mt-4 pb-3" style={{
      zIndex: "5",
      height: "calc(100vh - 8rem)",
    }}>
      <List />
      <List />
      <List />
      <List />
      <List />
    </div>
  );
};

export default BoardLists;
