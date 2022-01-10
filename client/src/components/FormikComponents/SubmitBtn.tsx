import { useFormikContext } from "formik";
import React from "react";

interface Props {
  text: string;
  isSubmitting: boolean;
  classes?: string;
}

const SubmitBtn = ({ text, isSubmitting, classes }: Props) => {
  const { dirty, isValid } = useFormikContext();

  return isSubmitting === true ? (
    <button
      className="btn-primary mb-4 w-full disabled:opacity-100 cursor-default flex items-center justify-center"
      disabled
    >
      <svg
        className="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </button>
  ) : (
    <button
      type="submit"
      className={`btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed ${classes}`}
      disabled={!(dirty && isValid)}
    >
      {text}
    </button>
  );
};

export default SubmitBtn;
