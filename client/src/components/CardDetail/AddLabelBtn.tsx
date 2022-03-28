import { AxiosError } from "axios";
import React, { useCallback, useState } from "react";
import {
  HiOutlineCheck,
  HiOutlinePencil,
  HiOutlinePencilAlt,
  HiOutlineRefresh,
  HiOutlineTag,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { hideModal, showModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { LabelObj, LabelObjCard } from "../../types";
import { BOARD_LABEL_MODAL, ERROR } from "../../types/constants";
import UtilityBtn from "../UtilityBtn/UtilityBtn";
import LabelCreate from "./LabelCreate";

interface Props {
  cardId: string;
  listId: string;
  boardId: string;
  spaceId: string;
}

const AddLabelBtn = ({ cardId, listId, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [show, setShow] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [currentLabel, setCurrentLabel] = useState<LabelObj | null>(null);

  const ref = useClose(() => {
    setShow(false);
    setIsFirst(true);
    setCurrentLabel(null);
  });

  const removeLabel = (labelId: string) => {
    axiosInstance
      .delete(`/cards/${cardId}/labels`, {
        data: {
          labelId,
        },
      })
      .then((response) => {
        queryClient.setQueryData(["getCard", cardId], (oldData: any) => {
          return {
            ...oldData,
            labels: oldData.labels
              ? oldData.labels.filter((l: any) => l._id !== labelId)
              : [],
          };
        });

        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.setQueryData(
          ["getAllCardLabels", cardId],
          (oldData: any) => {
            return oldData.map((l: any) => {
              if (l._id === labelId) {
                return {
                  ...l,
                  isPresent: false,
                };
              } else {
                return l;
              }
            });
          }
        );

        // update all card which depends on it
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              setShow(false);
              setIsFirst(true);
              setCurrentLabel(null);

              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
              queryClient.invalidateQueries(["getAllCardLabels", cardId]);
              queryClient.invalidateQueries(["getBoardLabels", boardId]);
              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              setShow(false);
              setIsFirst(true);
              setCurrentLabel(null);

              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getBoardLabels", boardId]);
              queryClient.invalidateQueries(["getAllCardLabels", cardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getBoardLabels", boardId]);

              queryClient.invalidateQueries(["getAllCardLabels", cardId]);
              dispatch(addToast({ kind: ERROR, msg: message }));
              setShow(false);
              setIsFirst(true);
              setCurrentLabel(null);

              dispatch(hideModal());
              break;
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

  const addLabel = (labelId: string) => {
    axiosInstance
      .put(`/cards/${cardId}/labels`, {
        labelId,
      })
      .then((response) => {
        const { data } = response.data;

        queryClient.setQueryData(["getCard", cardId], (oldData: any) => {
          return {
            ...oldData,
            labels: oldData.labels ? [...oldData.labels, data] : [data],
          };
        });

        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.setQueryData(
          ["getAllCardLabels", cardId],
          (oldData: any) => {
            return oldData.map((l: any) => {
              if (l._id === labelId) {
                return {
                  ...l,
                  isPresent: true,
                };
              }
              return l;
            });
          }
        );

        // update all card which depends on it
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 409:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            case 403:
              setShow(false);
              setIsFirst(true);
              setCurrentLabel(null);

              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
              queryClient.invalidateQueries(["getAllCardLabels", cardId]);
              queryClient.invalidateQueries(["getBoardLabels", boardId]);
              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              setShow(false);
              setIsFirst(true);
              setCurrentLabel(null);

              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getBoardLabels", boardId]);
              queryClient.invalidateQueries(["getAllCardLabels", cardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);

              queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getBoardLabels", boardId]);

              queryClient.invalidateQueries(["getAllCardLabels", cardId]);
              dispatch(addToast({ kind: ERROR, msg: message }));
              setShow(false);
              setIsFirst(true);
              setCurrentLabel(null);

              dispatch(hideModal());
              break;
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

  const deleteLabel = useCallback(
    (boardId: string, labelId: string) => {
      axiosInstance
        .delete(`/boards/${boardId}/labels`, {
          data: {
            labelId,
          },
          headers: {
            ContentType: "application/json",
          },
        })
        .then((response) => {
          queryClient.invalidateQueries(["getAllMyCards"]);

          queryClient.setQueryData(["getCard", cardId], (oldData: any) => {
            return {
              ...oldData,
              labels: oldData.labels
                ? oldData.labels.filter((l: any) => l._id !== labelId)
                : [],
            };
          });

          if (queryClient.getQueryData(["getBoardLabels", boardId])) {
            queryClient.setQueryData(
              ["getBoardLabels", boardId],
              (oldData: any) => {
                return oldData.filter((l: any) => l._id !== labelId);
              }
            );
          }

          queryClient.setQueryData(
            ["getAllCardLabels", cardId],
            (oldData: any) => {
              return oldData.filter((l: any) => l._id !== labelId);
            }
          );

          // update all card which depends on it
          queryClient.invalidateQueries(["getLists", boardId]);
        })
        .catch((error: AxiosError) => {
          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 403:
                setShow(false);
                setIsFirst(true);
                setCurrentLabel(null);

                dispatch(hideModal());

                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
                queryClient.invalidateQueries(["getAllCardLabels", cardId]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                setShow(false);
                setIsFirst(true);
                setCurrentLabel(null);

                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
                queryClient.invalidateQueries(["getAllCardLabels", cardId]);
                queryClient.invalidateQueries(["getLists", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);

                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
                break;
              case 400:
                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
                queryClient.invalidateQueries(["getAllCardLabels", cardId]);

                dispatch(addToast({ kind: ERROR, msg: message }));
                setShow(false);
                setIsFirst(true);
                setCurrentLabel(null);

                dispatch(hideModal());
                break;
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
    },
    [spaceId, cardId, boardId]
  );

  const getAllBoardLabels = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/cards/${queryKey[1]}/labels`);

    const { data } = response.data;

    return data;
  };

  const { data, isLoading, isFetching, error } = useQuery<
    LabelObjCard[] | undefined,
    any,
    LabelObjCard[],
    string[]
  >(["getAllCardLabels", cardId], getAllBoardLabels);

  let component = null;

  if (error) {
    component = (
      <p className="mt-6 ml-4 text-center flex items-center p-1">
        An error has occurred: {error.message}
        <UtilityBtn
          iconSize={16}
          classes="ml-2"
          Icon={HiOutlineRefresh}
          label="Retry"
          uniqueId="error-board-lists-retry"
          onClick={() => {
            queryClient.invalidateQueries(["getAllCardLabels", cardId]);
          }}
        />
      </p>
    );
  } else if (isLoading) {
    component = <p className="mt-6 ml-4 text-center">Loading...</p>;
  } else {
    component = (
      <div className="all-board-labels px-4">
        <div className="board-labels mb-4">
          <span className="text-sm text-slate-600 mb-2 inline-block font-semibold">
            Labels
          </span>
        </div>

        <div className="labels">
          {data && data.length > 0 ? (
            data
              .sort((a: any, b: any) =>
                a.pos > b.pos ? 1 : b.pos > a.pos ? -1 : 0
              )
              .map((l) => {
                return (
                  <div key={l._id} className="label flex items-center gap-x-6">
                    <button
                      onClick={() => {
                        if (l.isPresent) {
                          removeLabel(l._id);
                        } else {
                          addLabel(l._id);
                        }
                      }}
                      key={l._id}
                      className="label p-2 rounded text-white text-left 
          hover:border-l-8 hover:border-slate-700 font-semibold mb-2 w-full h-9 text-sm flex items-center justify-between"
                      style={{
                        background: l.color,
                      }}
                    >
                      <span className="name">
                        {l.name && l.name.length > 28
                          ? l.name?.slice(0, 28) + "..."
                          : l.name}
                      </span>

                      {l.isPresent && <HiOutlineCheck size={16} />}
                    </button>

                    <div className="right-btns flex items-center gap-x-4">
                      <button
                        onClick={() => {
                          setIsFirst(false);
                          setCurrentLabel(l);
                        }}
                      >
                        <HiOutlinePencil className="text-slate-700" size={18} />
                      </button>
                      <button onClick={() => deleteLabel(boardId, l._id)}>
                        <HiOutlineTrash className="text-slate-700" size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="no-labels">No labels :(</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="add-label-btn relative">
      <button
        onClick={() => setShow((prevValue) => !prevValue)}
        className="card-detail-btn"
      >
        <HiOutlineTag size={16} className="mr-1" />
        Labels
      </button>

      {show && (
        <>
          {isFirst ? (
            <div
              className="bg-white rounded shadow-lg absolute top-8 left-0 z-40"
              style={{
                width: "400px",
              }}
            >
              <header className="flex items-center justify-between p-3 border-b mb-2">
                <span className="font-semibold">Labels</span>
                <button
                  onClick={() => {
                    setShow(false);
                    setIsFirst(true);
                    setCurrentLabel(null);
                  }}
                >
                  <HiOutlineX size={18} />
                </button>
              </header>

              {component && component}

              <div className="buttons mx-4 mb-4">
                <button
                  className="btn-primary_light text-sm mt-6 w-full"
                  onClick={() => {
                    setIsFirst(false);
                  }}
                >
                  Create a new label
                </button>
              </div>
            </div>
          ) : (
            <LabelCreate
              cardId={cardId}
              boardId={boardId}
              spaceId={spaceId}
              setShow={setShow}
              setIsFirst={setIsFirst}
              currentLabel={currentLabel}
              setCurrentLabel={setCurrentLabel}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AddLabelBtn;
