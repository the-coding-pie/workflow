import { FormikErrors, useFormikContext } from "formik";
import React from "react";

interface Props {
  text: string;
  fieldsOnPage: string[];
  onClick: () => void;
  classes?: string;
}

const containsError = (
  errors: FormikErrors<unknown>,
  fieldsOnPage: string[]
) => {
  let contains = false;

  fieldsOnPage.forEach((field) => {
    if (Object.keys(errors).includes(field)) {
      contains = true;
    }
  });

  return contains;
};

const NextBtn = ({ text, classes, fieldsOnPage, onClick }: Props) => {
  const { errors, dirty } = useFormikContext();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed ${classes}`}
      disabled={containsError(errors, fieldsOnPage) || !dirty}
    >
      {text}
    </button>
  );
};

export default NextBtn;
