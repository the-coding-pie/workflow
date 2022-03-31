import axios, { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { HiOutlineRefresh, HiOutlineX } from "react-icons/hi";
import { RiWindowFill } from "react-icons/ri";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import { UNSPLASH_URL } from "../../config";
import useClose from "../../hooks/useClose";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { BOARD_COLORS, ERROR } from "../../types/constants";
import Loader from "../Loader/Loader";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

interface Props {
  coverImg: string;
  color: string;
  cardId: string;
  listId: string;
  boardId: string;
  spaceId: string;
}

const AddCoverBtn = ({
  coverImg,
  color,
  cardId,
  listId,
  boardId,
  spaceId,
}: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [show, setShow] = useState(false);

  const [colors, setColors] = useState(BOARD_COLORS);

  const [colorFromImg, setColorFromImg] = useState("");
  const [currentChoosen, setCurrentChoosen] = useState(colors[0]);

  const getCardImages = async () => {
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
    ["getCardImages"],
    getCardImages,
    {
      staleTime: Infinity,
    }
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
      setColorFromImg("");
    }
  }, [currentChoosen]);

  const updateCover = () => {
    axiosInstance
      .put(
        `/cards/${cardId}/cover`,
        {
          coverImg: currentChoosen.startsWith("#") ? "" : currentChoosen,
          color: currentChoosen.startsWith("#") ? currentChoosen : colorFromImg,
        },
        {
          headers: {
            ContentType: "application/json",
          },
        }
      )
      .then((response) => {
        setShow(false);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            coverImg: currentChoosen.startsWith("#") ? "" : currentChoosen,
            color: currentChoosen.startsWith("#")
              ? currentChoosen
              : colorFromImg,
          };
        });

        queryClient.invalidateQueries(["getAllMyCards"]);

        // update in getLists query Cache
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              setShow(false);
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              setShow(false);
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);

              queryClient.invalidateQueries(["getRecentBoards"]);
              queryClient.invalidateQueries(["getAllMyCards"]);

              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
            case 500:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
              break;
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }
      });
  };

  const removeCover = () => {
    axiosInstance
      .delete(`/cards/${cardId}/cover`)
      .then((response) => {
        setShow(false);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          delete oldValue.coverImg;
          delete oldValue.color;

          return {
            ...oldValue,
          };
        });

        queryClient.invalidateQueries(["getAllMyCards"]);

        // update in getLists query Cache
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              setShow(false);
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              setShow(false);
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);

              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
            case 500:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
              break;
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }
      });
  };

  const ref = useClose(() => setShow(false));

  return (
    <div ref={ref} className="add-cover-btn relative">
      <button
        onClick={() => setShow((prevValue) => !prevValue)}
        className="card-detail-btn flex items-center"
      >
        <RiWindowFill size={16} className="mr-1" />
        Cover
      </button>

      {show && (
        <div
          className="bg-white rounded shadow-lg absolute top-0 left-0 z-40"
          style={{
            width: "400px",
          }}
        >
          <header className="flex items-center justify-between p-3 border-b mb-2">
            <span className="font-semibold">Cover</span>
            <button onClick={() => setShow(false)}>
              <HiOutlineX size={18} />
            </button>
          </header>

          <div className="flex items-center mb-2">
            <label
              htmlFor="background"
              className="font-medium text-sm mr-2 px-4"
            >
              New Cover
            </label>

            {!isFetching && !error && (
              <UtilityBtn
                iconSize={14}
                Icon={HiOutlineRefresh}
                label="New Images"
                uniqueId="card-bg-new-images"
                iconClasses={isFetching ? "animate-spin" : ""}
                onClick={() => {
                  queryClient.invalidateQueries(["getCardImages"]);
                }}
              />
            )}
          </div>

          <div id="background" className="px-4 pb-6">
            <div className="mb-8 bg-images h-16">
              {isFetching || error ? (
                isFetching ? (
                  <div className="w-full flex items-center justify-center">
                    <Loader />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <UtilityBtn
                      uniqueId="board-bg-retry"
                      iconSize={24}
                      Icon={HiOutlineRefresh}
                      label="Retry"
                      iconClasses={isFetching ? "animate-spin" : ""}
                      onClick={() => {
                        queryClient.invalidateQueries(["getCardImages"]);
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
                    currentChoosen === color
                      ? "border-2 border-fuchsia-500"
                      : ""
                  }`}
                  style={{
                    background: color,
                    minWidth: "80px",
                  }}
                ></button>
              ))}
            </div>

            <div className="btns mt-8">
              {(coverImg || color) && (
                <button
                  className="btn-primary text-sm w-full mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={() => removeCover()}
                >
                  Remove Cover
                </button>
              )}

              <button
                disabled={!currentChoosen}
                className="btn-primary text-sm  w-full disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => updateCover()}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCoverBtn;
