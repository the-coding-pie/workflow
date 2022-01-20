import { FormikErrors, useFormikContext } from "formik";
import React from "react";
import { useEffect } from "react";

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

  const handler = (e: any) => {
    if (e.type === "keydown") {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!containsError(errors, fieldsOnPage) && dirty) {
          onClick();
        }
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handler, false);

    return () => {
      document.removeEventListener("keydown", handler, false);
    };
  }, [errors, dirty]);

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
