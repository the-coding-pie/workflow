import React from "react";

interface Props {
  name: string;
}

const CreateBoardModal = (props: Props) => {
  console.log(props);
  return <div>Create {name}</div>;
};

export default CreateBoardModal;
