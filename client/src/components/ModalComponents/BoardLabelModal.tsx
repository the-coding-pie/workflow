import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { LabelObj } from "../../types";
import * as Yup from "yup";
import Input from "../FormikComponents/Input";
import ColorLabel from "../FormikComponents/ColorLabel";
import SubmitBtn from "../FormikComponents/SubmitBtn";
import { useDispatch } from "react-redux";
import { hideModal } from "../../redux/features/modalSlice";
import axiosInstance from "../../axiosInstance";
import { useQueryClient } from "react-query";
import { AxiosError } from "axios";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR } from "../../types/constants";

interface Props {
  label?: LabelObj;
  boardId: string;
  spaceId: string;
}

interface LabelDetailObj {
  name: string;
  color: string;
}

const BoardLabelModal = ({ label, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: LabelDetailObj = {
    name: label && label.name ? label.name : "",
    color: label ? label.color : "",
  };

  const validationSchema = Yup.object({
    name: Yup.string(),
    color: Yup.string().required("Color is required"),
  });

  const handleSubmit = (value: any, boardId: string) => {
    if (label) {
      // update
      axiosInstance
        .put(
          `/boards/${boardId}/labels`,
          {
            labelId: label._id,
            ...value,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          dispatch(hideModal());

          const { data } = response.data;

          queryClient.invalidateQueries(["getCard"]);

          queryClient.invalidateQueries(["getAllCardLabels"]);

          queryClient.setQueryData(
            ["getBoardLabels", boardId],
            (oldData: any) => {
              return oldData.map((l: LabelObj) => {
                if (l._id === label._id) {
                  return data;
                } else {
                  return l;
                }
              });
            }
          );

          queryClient.invalidateQueries(["getAllMyCards"]);

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
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
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
                queryClient.invalidateQueries(["getBoardLabels", boardId]);

                dispatch(addToast({ kind: ERROR, msg: message }));

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
    } else {
      // create
      axiosInstance
        .post(
          `/boards/${boardId}/labels`,
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
          dispatch(hideModal());

          const { data } = response.data;

          queryClient.invalidateQueries(["getCard"]);

          queryClient.invalidateQueries(["getAllCardLabels"]);

          queryClient.setQueryData(
            ["getBoardLabels", boardId],
            (oldData: any) => {
              oldData.push(data);
              return oldData;
            }
          );
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
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getBoardLabels", boardId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
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
                queryClient.invalidateQueries(["getBoardLabels", boardId]);

                dispatch(addToast({ kind: ERROR, msg: message }));

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
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleSubmit(values, boardId);
      }}
    >
      <Form
        className="board-label p-4"
        style={{
          width: "650px",
        }}
      >
        <Input
          id="name"
          label="Name"
          name="name"
          type="text"
          autoFocus={true}
        />

        <ColorLabel
          label="Select a color"
          name="color"
          selected={label?.color}
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
              dispatch(hideModal());
            }}
            className="font-semibold"
          >
            Cancel
          </button>
        </div>
      </Form>
    </Formik>
  );
};

export default BoardLabelModal;
