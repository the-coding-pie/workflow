import { useFormikContext } from "formik";
import React from "react";
import Loader from "../Loader/Loader";

interface Props {
  text: string;
  isSubmitting: boolean;
  classes?: string;
  disabled?: boolean;
  noDirtyCheck?: boolean;
}

const SubmitBtn = ({
  text,
  isSubmitting,
  classes,
  disabled = false,
  noDirtyCheck = false,
}: Props) => {
  const { isValid, dirty } = useFormikContext();

  return isSubmitting === true ? (
    <button
      className={`btn-primary w-full disabled:opacity-100 cursor-default flex items-center justify-center ${classes}`}
      disabled
    >
      <Loader size={21} />
    </button>
  ) : noDirtyCheck ? (
    <button
      type="submit"
      className={`btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed ${classes}`}
      disabled={!isValid || disabled}
    >
      {text}
    </button>
  ) : (
    <button
      type="submit"
      className={`btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed ${classes}`}
      disabled={!isValid || !dirty || disabled}
    >
      {text}
    </button>
  );
};

export default SubmitBtn;
