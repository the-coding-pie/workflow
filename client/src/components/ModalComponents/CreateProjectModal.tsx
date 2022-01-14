import React from "react";

interface Props {
    name: string
}

const CreateProjectModal = ({ name }: Props) => {
  return <div className="p-2">{name}</div>;
};

export default CreateProjectModal;
