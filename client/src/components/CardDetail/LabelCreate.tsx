import { Form, Formik } from "formik";
import React, { useState } from "react";
import { HiChevronLeft, HiOutlineArrowLeft, HiOutlineX } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { addToast } from "../../redux/features/toastSlice";
import { LabelObj } from "../../types";
import { ERROR } from "../../types/constants";
import * as Yup from "yup";
import axiosInstance from "../../axiosInstance";
import { AxiosError } from "axios";
import Input from "../FormikComponents/Input";
import ColorLabel from "../FormikComponents/ColorLabel";
import SubmitBtn from "../FormikComponents/SubmitBtn";

interface LabelDetailObj {
  name: string;
  color: string;
}

interface Props {
  cardId: string;
  boardId: string;
  spaceId: string;
  currentLabel: LabelObj | null;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFirst: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentLabel: React.Dispatch<React.SetStateAction<LabelObj | null>>;
}

const LabelCreate = ({
  cardId,
  boardId,
  spaceId,
  currentLabel,
  setIsFirst,
  setShow,
  setCurrentLabel,
}: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: LabelDetailObj = {
    name: currentLabel && currentLabel.name ? currentLabel.name : "",
    color: currentLabel ? currentLabel.color : "",
  };

  const validationSchema = Yup.object({
    name: Yup.string(),
    color: Yup.string().required("Color is required"),
  });

  const handleSubmit = (value: any, boardId: string) => {
    if (currentLabel) {
      // update
      axiosInstance
        .put(
          `/boards/${boardId}/labels`,
          {
            labelId: currentLabel._id,
            ...value,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          setIsFirst(true);
          setCurrentLabel(null);

          queryClient.invalidateQueries(["getAllMyCards"]);

          const { data } = response.data;

          queryClient.setQueryData(["getCard", cardId], (oldData: any) => {
            return {
              ...oldData,
              labels: oldData.labels
                ? oldData.labels.map((l: LabelObj) => {
                    if (l._id === currentLabel._id) {
                      return data;
                    } else {
                      return l;
                    }
                  })
                : [],
            };
          });

          queryClient.setQueryData(
            ["getAllCardLabels", cardId],
            (oldData: any) => {
              return oldData.map((l: LabelObj) => {
                if (l._id === currentLabel._id) {
                  return data;
                } else {
                  return l;
                }
              });
            }
          );

          if (queryClient.getQueryData(["getBoardLabels", boardId])) {
            queryClient.setQueryData(
              ["getBoardLabels", boardId],
              (oldData: any) => {
                return oldData.map((l: LabelObj) => {
                  if (l._id === currentLabel._id) {
                    return data;
                  } else {
                    return l;
                  }
                });
              }
            );
          }

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

                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getAllCardLabels", cardId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
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
                queryClient.invalidateQueries(["getAllCardLabels", cardId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);

                dispatch(addToast({ kind: ERROR, msg: message }));

                setShow(false);
                setIsFirst(true);
                setCurrentLabel(null);
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
    } else {
      // create
      axiosInstance
        .post(
          `/cards/${cardId}/labels`,
          {
            ...value,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          setIsFirst(true);
          setCurrentLabel(null);

          queryClient.invalidateQueries(["getAllMyCards"]);

          const { data } = response.data;

          queryClient.invalidateQueries(["getCard", cardId]);

          queryClient.invalidateQueries(["getAllCardLabels"]);

          if (queryClient.getQueryData(["getBoardLabels", boardId])) {
            queryClient.setQueryData(
              ["getBoardLabels", boardId],
              (oldData: any) => {
                oldData.push(data);
                return oldData;
              }
            );
          }

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

                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
                queryClient.invalidateQueries(["getAllCardLabels", cardId]);
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
    }
  };

  return (
    <div
      className="bg-white rounded shadow-lg absolute top-8 left-0 z-40"
      style={{
        width: "400px",
      }}
    >
      <header className="flex items-center justify-between p-3 border-b mb-2">
        <button
          onClick={() => {
            setIsFirst(true);
            setCurrentLabel(null);
          }}
        >
          <HiChevronLeft size={18} />
        </button>
        <span className="font-semibold">Create Label</span>
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

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSubmit(values, boardId);
        }}
      >
        <Form className="board-label p-4 w-full">
          <Input id="name" label="Name" name="name" type="text" />

          <ColorLabel
            label="Select a color"
            name="color"
            selected={currentLabel?.color}
          />

          <div className="buttons flex items-center gap-x-4 justify-center">
            <SubmitBtn
              isSubmitting={isSubmitting}
              text="Save"
              classes="w-24"
              noDirtyCheck={true}
            />

            <button
              type="button"
              onClick={() => {
                setIsFirst(true);
                setCurrentLabel(null);
              }}
              className="font-semibold"
            >
              Cancel
            </button>
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default LabelCreate;
