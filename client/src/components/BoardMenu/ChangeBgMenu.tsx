import React, { useCallback, useState } from "react";
import BoardBackground from "../FormikComponents/BoardBackground";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import SubmitBtn from "../FormikComponents/SubmitBtn";

interface BoardBGObj {
  bgImg: string;
  color: string;
}

interface Props {
  spaceId: string;
  boardId: string;
}

const ChangeBgMenu = ({ spaceId, boardId }: Props) => {
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

  const handleSubmit = useCallback((boardBg: BoardBGObj) => {
    setIsSubmitting(true);
    console.log(boardBg);
  }, []);

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
