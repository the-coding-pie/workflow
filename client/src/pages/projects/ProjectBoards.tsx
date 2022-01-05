import React from "react";
import { useParams } from "react-router-dom";
import Board from "../../components/Board/Board";
import projects from "../../data/projects";

const ProjectBoards = () => {
  const { id } = useParams();

  const project = projects.find((p) => p._id === id);

  return (
    <div className="project-boards px-8 py-6">
      <div className="mt-6 flex items-center justify-start flex-wrap gap-x-6 gap-y-6">
        {project?.boards &&
          project?.boards.length > 0 &&
          project?.boards.map((b) => (
            <Board board={b} />
          ))}
      </div>
    </div>
  );
};

export default ProjectBoards;
