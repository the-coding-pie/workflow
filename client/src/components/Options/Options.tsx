import React, { useEffect } from "react";
import { useState } from "react";
import ReactDOM from "react-dom";

interface Props {
  show: boolean;
}

const Options: React.FC<Props> = ({ children, show }) => {
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    setIsSet(true);
  }, []);

  if (!isSet) {
    return null;
  }

  return (
    show && <>
    <div className="z-50">{children}</div>

    <div
      className="backdrop fixed top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full overflow-y-auto m-auto bg-black bg-opacity-5"
      style={{
        maxHeight: "100vh",
      }}
    ></div>
  </>
  );
};

export default Options;
