import { useEffect, useRef } from "react";

const useEscClose = (fn: Function) => {
  let ref = useRef<any>(null);

  const handler = (e: any) => {
    if (e.type === "keydown") {
      if (e.key === "Escape") {
        return fn();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handler, false);

    return () => {
      document.removeEventListener("keydown", handler, false);
    };
  }, []);

  return ref;
};

export default useEscClose;
