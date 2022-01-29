import React, { useState } from "react";

interface Props {
  initialValue: string;
}

const BoardName = ({ initialValue }: Props) => {
  const [name, setName] = useState(initialValue);
  const [lastVal, setLastVal] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(e.target.value);
    if (value !== "") {
      setLastVal(e.target.value);
    }
  };

  const handleBlur = () => {
    if (name === "") {
      setName(lastVal);
    }
  };

  return (
    <input
      className="border-none outline-none max-w-max bg-slate-50 shadow rounded px-2 py-1.5"
      onChange={(e) => handleChange(e)}
      value={name}
      onBlur={handleBlur}
    />
  );
};

export default BoardName;
