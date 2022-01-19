import axios from "axios";
import { useFormikContext } from "formik";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { UNSPLASH_URL } from "../../config";
import { BOARD_COLORS } from "../../types/constants";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

interface Props {
  label: string;
  fieldNames: string[];
  classes?: string;
}

const BoardBackground = ({ label, fieldNames, classes }: Props) => {
  const { setFieldValue } = useFormikContext();
  const queryClient = useQueryClient();

  const [colors, setColors] = useState(BOARD_COLORS);
  const [colorFromImg, setColorFromImg] = useState("");
  const [currentChoosen, setCurrentChoosen] = useState(colors[0]);

  const getBgImages = async () => {
    const response = await axios.get(
      `${UNSPLASH_URL}/photos/random?orientation=landscape&count=30`,
      {
        headers: {
          Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_CLIENT_ID}`,
        },
      }
    );

    return response.data;
  };

  const { data, isLoading, isFetching, error } = useQuery(
    ["getBgImages"],
    getBgImages
  );

  useEffect(() => {
    // if data(bgImg response data) is there and currentChoosen is not a color
    if (data && !colors.includes(currentChoosen)) {
      setCurrentChoosen(data[0].urls.regular);
    } else {
      setCurrentChoosen(currentChoosen);
    }
  }, [data]);

  useEffect(() => {
    if (currentChoosen.startsWith("#")) {
      // it is a color
      setFieldValue(fieldNames[0], "");
      setFieldValue(fieldNames[1], currentChoosen);
      setColorFromImg("");
    } else {
      // image
      setFieldValue(fieldNames[0], currentChoosen);
      // if color from image is present, use it, else choose random
      setFieldValue(
        fieldNames[1],
        colorFromImg
          ? colorFromImg
          : colors[Math.floor(Math.random() * colors.length)]
      );
    }
  }, [currentChoosen]);

  return (
    <div className={`flex flex-col w-full mb-6 ${classes}`}>
      <div className="flex items-center mb-2">
        <label htmlFor="background" className="font-medium text-sm mr-2">
          {label}
        </label>

        {!isFetching && !error && (
          <UtilityBtn
            iconSize={14}
            Icon={HiOutlineRefresh}
            label="New Images"
            iconClasses={isFetching ? "animate-spin" : ""}
            onClick={() => {
              queryClient.invalidateQueries(["getBgImages"]);
            }}
          />
        )}
      </div>

      <div id="background">
        <div className="mb-6 bg-images h-16">
          {isFetching || error ? (
            isFetching ? (
              <div className="w-full flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="text-primary"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                <UtilityBtn
                  iconSize={24}
                  Icon={HiOutlineRefresh}
                  label="Retry"
                  iconClasses={isFetching ? "animate-spin" : ""}
                  onClick={() => {
                    queryClient.invalidateQueries(["getBgImages"]);
                  }}
                />
              </div>
            )
          ) : (
            <div className="images max-w-full overflow-x-auto flex items-center pb-1">
              {data &&
                data.map((image: any) => {
                  return (
                    <button
                      type="button"
                      key={image.id}
                      aria-label="background images"
                      onClick={() => {
                        setCurrentChoosen(image.urls.regular);
                        setColorFromImg(image.color);
                      }}
                      className={`image mr-4 ${
                        currentChoosen === image.urls.regular
                          ? "border-2 border-fuchsia-500"
                          : ""
                      }`}
                    >
                      <img
                        style={{
                          minWidth: "80px",
                        }}
                        src={image.urls.thumb}
                        alt={image.description}
                      />
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        <div className="colors flex items-center overflow-x-auto w-full pb-1.5">
          {colors.map((color) => (
            <button
              type="button"
              aria-label="background color select button"
              onClick={() => setCurrentChoosen(color)}
              key={color}
              className={`h-10 hover:bg-opacity-50 mr-4 rounded ${
                currentChoosen === color ? "border-2 border-fuchsia-500" : ""
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

export default BoardBackground;
