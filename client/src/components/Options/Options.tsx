import React, { useEffect } from "react";
import { useState } from "react";
import ReactDOM from "react-dom";
import useClose from "../../hooks/useClose";

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  x: number;
  y: number;
}

const Options: React.FC<Props> = ({ children, show, setShow, x, y }) => {
  const [isSet, setIsSet] = useState(false);

  useEffect(() => {
    setIsSet(true);
  }, []);

  const optionsBoxRef = useClose(() => setShow(false));

  if (!isSet) {
    return null;
  }

  return (
    show && (
      <div
        className="backdrop fixed top-0 bottom-0 left-0 right-0 z-40 flex items-center justify-center w-full h-full m-auto bg-black bg-opacity-0"
        style={{
          maxHeight: "100vh",
        }}
      >
        <div
          ref={optionsBoxRef}
          className="z-50 absolute"
          style={{
            left: x,
            top: y / 2,
          }}
        >
          {children}
        </div>
      </div>
    )
  );
};

export default Options;
