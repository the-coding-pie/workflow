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

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflowX = "hidden";
      document.body.style.overflowY = "auto";
    };
  }, []);

  const optionsBoxRef = useClose(() => setShow(false));

  if (!isSet) {
    return null;
  }

  return (
    show && (
      <div
        className="backdrop fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center w-full h-full m-auto bg-black bg-opacity-0"
        style={{
          maxHeight: "100vh",
        }}
      >
        <ul
          ref={optionsBoxRef}
          className="absolute options block bg-white rounded shadow-lg"
          style={
            y > window.innerHeight / 2 + 20
              ? {
                  left: x - 20,
                  bottom: window.innerHeight - y - 7,
                  minWidth: "150px",
                }
              : {
                  left: x - 20,
                  top: y - 50,
                  minWidth: "150px",
                }
          }
        >
          {children}
        </ul>
      </div>
    )
  );
};

export default Options;
