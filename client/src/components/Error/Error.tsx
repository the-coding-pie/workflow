import React from "react";

interface Props {
  msg: string;
  title?: string;
}

const Error = ({ msg, title }: Props) => {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        {title && <h1 className="text-2xl font-semibold mb-2 text-slate-800">{title}</h1>}
        <p className="text-lg font-medium text-slate-700 mb-12">{msg}</p>
      </div>
    </div>
  );
};

export default Error;
