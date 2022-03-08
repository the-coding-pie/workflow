import { useField, useFormikContext } from "formik";
import React, { useEffect, useState } from "react";
import { LABEL_COLORS } from "../../types/constants";

interface Props {
  label: string;
  name: string;
  selected?: string;
  classes?: string;
}

const ColorLabel = ({ label, name, selected, classes }: Props) => {
  const { setFieldValue } = useFormikContext();
  const [colors, setColors] = useState(LABEL_COLORS);
  const [currentChoosen, setCurrentChoosen] = useState(selected || colors[0]);

  useEffect(() => {
    setFieldValue(name, currentChoosen);
  }, [currentChoosen]);

  return (
    <div className={`flex flex-col w-full mb-6 ${classes}`}>
      <div className="flex flex-col mb-2">
        <label className="font-medium text-sm mb-2">{label}</label>

        <div className="colors flex items-center overflow-x-auto w-full pb-1.5">
          {colors.map((color) => (
            <button
              type="button"
              aria-label="background color select button"
              onClick={() => setCurrentChoosen(color)}
              key={color}
              className={`h-10 hover:bg-opacity-50 mr-4 rounded ${
                currentChoosen === color ? "border-2 border-black" : ""
              }`}
              style={{
                background: color,
                minWidth: "80px",
              }}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorLabel;
