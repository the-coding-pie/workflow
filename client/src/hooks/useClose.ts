import { useEffect, useRef } from "react";

const useClose = (fn: Function) => {
  let ref = useRef<any>(null);

  const handler = (e: any) => {
    if (e.type === "mousedown") {
      if (ref.current && !ref.current.contains(e.target)) {
        return fn();
      }
    } else if (e.type === "keydown") {
      if (e.key === "Escape") {
        return fn();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handler, false);
    document.addEventListener("keydown", handler, false);

    return () => {
      document.removeEventListener("mousedown", handler, false);
      document.removeEventListener("keydown", handler, false);
    };
  });

  return ref;
};

export default useClose;
