import React from "react";
import { useParams } from "react-router-dom";
import Board from "../../Board/Board";
import projects from "../../data/projects";

const ProjectBoards = () => {
  const { id } = useParams();

  const project = projects.find((p) => p._id === id);

  return (
    <div className="project-boards px-8 py-6">
      <div className="grid grid-cols-4 gap-4">
        {project?.boards &&
          project?.boards.length > 0 &&
          project?.boards.map((b) => (
            <Board projectId={project._id} board={b} />
          ))}
      </div>
    </div>
  );
};

export default ProjectBoards;
