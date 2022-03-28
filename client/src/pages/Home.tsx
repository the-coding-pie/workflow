import React from "react";
import MyCards from "../components/MyCards/MyCards";
import RecentBoards from "../components/RecentBoards/RecentBoards";

const Home = () => {
  return (
    <div className="home">
      <section
        className="recent-board space-container px-8 pt-6 pb-4 mb-12 flex flex-col"
        style={{
          minHeight: "250px",
        }}
      >
        <h3 className="font-bold text-xl text-slate-700 mb-5">Recent Boards</h3>

        <RecentBoards />
      </section>

      <section
        className="my-tasks space-container px-8 pb-8 flex flex-col"
        style={{
          minHeight: "250px",
        }}
      >
        <h3 className="font-bold text-xl text-slate-700 mb-5">My Tasks</h3>

        <MyCards />
      </section>
    </div>
  );
};

export default Home;
