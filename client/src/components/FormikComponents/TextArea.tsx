import { useField } from "formik";
import React from "react";
import ErrorBox from "./ErrorBox";

interface Props {
  label: string;
  id: string;
  name: string;
  disabled?: boolean;
  optional?: boolean;
  inline?: boolean;
  classes?: string;
}

const TextArea = ({
  label,
  id,
  name,
  classes,
  disabled = false,
  optional = false,
  inline = false,
  ...props
}: Props) => {
  // props -> every props except label and type -> { name: 'value', id: 'value' }
  const [field, meta] = useField(name);

  return (
    <div className={`flex flex-col mb-6 ${classes}`}>
      <div
        className={`form-group flex ${
          inline ? " flex-row items-center" : "flex-col justify-center"
        }`}
      >
        <label
          className={`font-medium ${inline ? "mr-4" : "mb-2"}`}
          htmlFor={id}
        >
          {label}{" "}
          {optional && (
            <span className="optional text-slate-400">(Optional)</span>
          )}
        </label>
        <textarea
          {...field}
          {...props}
          disabled={disabled}
          className={`resize-none ${
            meta.touched && meta.error
              ? "border-red-400 "
              : "border-slate-200 focus:border-primary"
          } disabled:opacity-80`}
          style={{
            minHeight: "11rem",
            maxHeight: "11rem",
          }}
        ></textarea>
      </div>
      {meta.touched && meta.error && <ErrorBox msg={meta.error} />}
    </div>
  );
};

export default TextArea;
