import React from "react";

interface Props {
  msg: string;
}

const Error = ({ msg }: Props) => {
  return <div className="h-screen w-full flex items-center justify-center">
    <p className="text-lg mb-12">{msg}</p>
  </div>;
};

export default Error;
