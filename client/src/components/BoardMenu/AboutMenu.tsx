import React, { useCallback, useState } from "react";
import { BOARD_ROLES, ERROR, SUCCESS } from "../../types/constants";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import TextArea from "../FormikComponents/TextArea";
import SubmitBtn from "../FormikComponents/SubmitBtn";
import axiosInstance from "../../axiosInstance";
import { useDispatch } from "react-redux";
import { useQueryClient } from "react-query";
import { addToast } from "../../redux/features/toastSlice";
import { AxiosError } from "axios";

interface DescriptionObj {
  description: string;
}

interface Props {
  description: string;
  spaceId: string;
  boardId: string;
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const AboutMenu = ({ description, spaceId, boardId, myRole }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const initialValues: DescriptionObj = {
    description: description,
  };

  const validationSchema = Yup.object({
    description: Yup.string(),
  });

  const handleSubmit = useCallback(
    ({ description }: DescriptionObj) => {
      setIsSubmitting(true);

      axiosInstance
        .put(
          `/boards/${boardId}/description`,
          {
            description,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          const { message } = response.data;

          dispatch(
            addToast({
              kind: SUCCESS,
              msg: message,
            })
          );

          setIsSubmitting(false);

          queryClient.invalidateQueries(["getBoard", boardId]);
        })
        .catch((error: AxiosError) => {
          setIsSubmitting(false);

          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 403:
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                break;
              case 404:
                dispatch(addToast({ kind: ERROR, msg: message }));

                queryClient.invalidateQueries(["getBoard", boardId]);
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);

                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);

                queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
                queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
                queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
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
    },
    [boardId, spaceId]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="board-about px-4">
      {[BOARD_ROLES.ADMIN, BOARD_ROLES.NORMAL].includes(myRole) ? (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => handleSubmit(values)}
        >
          <Form>
            <TextArea id="description" name="description" label="Description" />

            <SubmitBtn
              noDirtyCheck={true}
              text="Save"
              isSubmitting={isSubmitting}
            />
          </Form>
        </Formik>
      ) : (
        <div>
          <label className={`font-medium block mb-2`}>Description</label>
          <textarea
            style={{
              minHeight: "11rem",
              maxHeight: "11rem",
            }}
            className="outline-none rounded px-2 py-1.5 mb-0.5 bg-slate-200 w-full resize-none cursor-not-allowed"
            disabled
            value={""}
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default AboutMenu;
