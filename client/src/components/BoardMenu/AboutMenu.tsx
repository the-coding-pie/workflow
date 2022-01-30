import React, { useCallback, useState } from "react";
import { BOARD_ROLES } from "../../types/constants";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import TextArea from "../FormikComponents/TextArea";
import SubmitBtn from "../FormikComponents/SubmitBtn";

interface DescriptionObj {
  description: string;
}

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const AboutMenu = ({ myRole }: Props) => {
  const initialValues: DescriptionObj = {
    description: "",
  };

  const validationSchema = Yup.object({
    description: Yup.string(),
  });

  const handleSubmit = useCallback(({ description }: DescriptionObj) => {}, []);

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

            <SubmitBtn noDirtyCheck={true} text="Save" isSubmitting={isSubmitting} />
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
