import React from "react";
import RecentBoards from "../components/RecentBoards/RecentBoards";

const Home = () => {
  return (
    <div className="home">
      <section
        className="recent-board space-container px-8 pt-6 pb-4 flex flex-col"
        style={{
          minHeight: "250px",
        }}
      >
        <h3 className="font-bold text-xl text-slate-700">Recent Boards</h3>

        <RecentBoards />
      </section>

      <section
        className="my-tasks space-container px-8 pb-8 flex flex-col"
        style={{
          minHeight: "250px",
        }}
      >
        <h3 className="font-bold text-xl text-slate-700">My Tasks</h3>

        <RecentBoards />
      </section>
    </div>
  );
};

export default Home;
