import React from "react";
import Card from "./Card";

const List = () => {
  return (
    <div
      className="list first:ml-4 bg-slate-100 shadow p-2 rounded flex flex-col"
      style={{
        flex: "0 0 18rem",
        maxHeight: "calc(100vh - 10.2rem)",
      }}
    >
      <header className="list__header mb-1">
        <h3 className="list-title font-semibold text-base">Hello</h3>
      </header>

      <ul
        id="list-items"
        className="list-items flex-1 flex flex-col overflow-y-auto"
      >
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
        <Card />
      </ul>

      <button>Add a card</button>
    </div>
  );
};

export default List;
