import React from "react";

interface Props {
  msg: string;
}

const ErrorBox = ({ msg }: Props) => {
  return <p className="text-sm mb-1 text-red-500 max-w-xs">{msg}</p>;
};

export default ErrorBox;
