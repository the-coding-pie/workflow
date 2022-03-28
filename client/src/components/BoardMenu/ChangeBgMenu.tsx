import React, { useCallback, useState } from "react";
import BoardBackground from "../FormikComponents/BoardBackground";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import SubmitBtn from "../FormikComponents/SubmitBtn";
import axiosInstance from "../../axiosInstance";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR, SUCCESS } from "../../types/constants";
import { AxiosError } from "axios";

interface BoardBGObj {
  bgImg: string;
  color: string;
}

interface Props {
  spaceId: string;
  boardId: string;
}

const ChangeBgMenu = ({ spaceId, boardId }: Props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const initialValues: BoardBGObj = {
    bgImg: "",
    color: "",
  };
  const validationSchema = Yup.object({
    bgImg: Yup.string(),
    color: Yup.string()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code")
      .required("Color is required"),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (boardBg: BoardBGObj) => {
      setIsSubmitting(true);

      axiosInstance
        .put(
          `/boards/${boardId}/background`,
          {
            ...boardBg,
          },
          {
            headers: {
              ContentType: "application/json",
            },
          }
        )
        .then((response) => {
          const { message } = response.data;

          setIsSubmitting(false);

          queryClient.invalidateQueries(["getRecentBoards"]);

          queryClient.invalidateQueries(["getBoard", boardId]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);
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

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => handleSubmit(values)}
    >
      <Form className="board-change-bg px-4">
        <BoardBackground label="Background" fieldNames={["bgImg", "color"]} />

        <SubmitBtn text="Update" classes="mb-4" isSubmitting={isSubmitting} />
      </Form>
    </Formik>
  );
};

export default ChangeBgMenu;
