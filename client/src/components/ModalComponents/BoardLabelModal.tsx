import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { LabelObj } from "../../types";
import * as Yup from "yup";
import Input from "../FormikComponents/Input";
import ColorLabel from "../FormikComponents/ColorLabel";
import SubmitBtn from "../FormikComponents/SubmitBtn";
import { useDispatch } from "react-redux";
import { hideModal } from "../../redux/features/modalSlice";

interface Props {
  label?: LabelObj;
}

interface LabelDetailObj {
  name: string;
  color: string;
}

const BoardLabelModal = ({ label }: Props) => {
  const dispatch = useDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: LabelDetailObj = {
    name: label && label.name ? label.name : "",
    color: label ? label.color : "",
  };

  const validationSchema = Yup.object({
    name: Yup.string(),
    color: Yup.string().required("Color is required"),
  });

  const handleSubmit = useCallback((value) => {
    if (label) {
      // update
    } else {
      // create
    }
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => handleSubmit(values)}
    >
      <Form className="board-label p-4" style={{
        width: "650px"
      }}>
        <Input id="name" label="Name" name="name" type="text" />

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
