import React from "react";
import { HiOutlinePlus } from "react-icons/hi";
import Card from "./Card";

const List = () => {
  return (
    <div
      className="list first:ml-4 p-2 rounded flex flex-col h-min"
      style={{
        background: "#EBECF0",
        flex: "0 0 18rem",
        maxHeight: "calc(100vh - 10.2rem)",
      }}
    >
      <header className="list__header mb-1">
        <h3 className="list-title font-semibold text-base px-2">Hello</h3>
      </header>

      <ul
        id="list-items"
        className="list-items flex-1 flex flex-col overflow-y-auto pr-1"
      >
       
      </ul>

      <button className="w-full cursor-pointer flex items-center px-2 py-1.5 hover:bg-gray-300 rounded text-gray-700 hover:text-gray-900 mt-1">
        <HiOutlinePlus className="mr-1" size={18} />
        <span>Add a card</span>
      </button>
    </div>
  );
};

export default List;
