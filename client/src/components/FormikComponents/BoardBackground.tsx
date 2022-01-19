import axios from "axios";
import React from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { UNSPLASH_URL } from "../../config";
import { BOARD_COLORS } from "../../types/constants";

interface Props {
  label: string;
  fieldNames: string[];
  classes?: string;
}

const BoardBackground = ({ label, fieldNames, classes }: Props) => {
  const [colors, setColors] = useState(BOARD_COLORS);

  const getBgImages = async () => {
    const response = await axios.get(`${UNSPLASH_URL}/photos/random`, {
      headers: {
        Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_CLIENT_ID}`,
      },
    });
  };

  const { data, isLoading, isFetching, error } = useQuery(
    ["getBgImages"],
    getBgImages
  );

  console.log(data);

  return (
    <div className={`flex flex-col w-full mb-6 ${classes}`}>
      <label htmlFor="background" className="font-medium text-sm mb-2">
        {label}
      </label>

      <div id="background">
        <div className="images"></div>

        <div className="colors flex items-center overflow-x-auto w-full pb-2">
          {colors.map((color) => (
            <button
              type="button"
              aria-label="background color select button"
              key={color}
              className="h-10 hover:bg-opacity-50 mr-6 rounded"
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

export default BoardBackground;
