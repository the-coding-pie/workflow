import React, { useCallback, useEffect, useState } from "react";
import { HiOutlineCheck } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import useClose from "../../hooks/useClose";
import { OptionWithSub } from "../../types";
import { BOARD_ROLES, BOARD_VISIBILITY_TYPES } from "../../types/constants";

interface Props {
  options: OptionWithSub[];
  visibility?:
    | typeof BOARD_VISIBILITY_TYPES.PRIVATE
    | typeof BOARD_VISIBILITY_TYPES.PUBLIC;
}

const BoardVisibilityDropdown = ({ options = [], visibility }: Props) => {
  const [currentValue, setCurrentValue] = useState("");

  const [showDropDown, setShowDropDown] = useState(false);

  const ref = useClose(() => {
    setShowDropDown(false);
  });

  useEffect(() => {
    if (options.length > 0) {
      const exists = options.find((o) => o.value === visibility);

      // if selected is given and it is also found in the given options
      if (exists) {
        setCurrentValue(exists.value);
      } else {
        setCurrentValue(options[0].value);
      }
    }
  }, [options]);

  const handleVisibilityChange = useCallback(() => {}, []);

  return (
    <div
      className="board-visibility-dropdown text-sm text-slate-600 relative"
      ref={ref}
    >
      <button
        onClick={(e) => setShowDropDown((prevValue) => !prevValue)}
        className="current-visibility rounded bg-stone-50 px-2 py-1.5"
      >
        <span>{currentValue}</span>
      </button>

      {showDropDown && (
        <div
          className="dropdown absolute bg-white z-20 top-10 left-0 shadow-lg rounded noselect"
          style={{
            width: "360px",
          }}
        >
          <header className="border-b px-4 py-3 flex items-center justify-between">
            <h2 className="font-medium">Change visibility</h2>

            <button
              onClick={() => setShowDropDown(false)}
              type="button"
              role="close-dropdown-options"
            >
              <MdClose size={16} />
            </button>
          </header>

          {options.map((o) => (
            <button
              onClick={() => handleVisibilityChange()}
              disabled={o.value === currentValue}
              className={`px-4 py-3
                        disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed
                       hover:bg-primary_light cursor-pointer
                    `}
              key={o.value}
              role={`button change-role-to${o.value}`}
            >
              <div className="title font-medium flex items-center mb-2">
                <span className="mr-3">{o.label}</span>
                {currentValue === o.value && <HiOutlineCheck size={15} />}
              </div>

              <p className="text-left">{o.sub}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardVisibilityDropdown;
