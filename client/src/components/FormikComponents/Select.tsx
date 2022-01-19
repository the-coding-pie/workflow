import { useField } from "formik";
import React, { useEffect } from "react";
import { Option } from "../../types";
import ErrorBox from "./ErrorBox";

interface Props {
  label: string;
  id: string;
  name: string;
  options: Option[];
  selected?: string;
  inline?: boolean;
  classes?: string;
}

const Select = ({
  label,
  id,
  name,
  options = [],
  selected,
  classes,
  inline,
  ...props
}: Props) => {
  // props -> every props except label and options -> { name: 'value', id: 'value' }
  const [field, meta, helpers] = useField(name);

  useEffect(() => {
    if (options.length > 0 && !field.value) {
      const exists = selected
        ? options.find((o) => o.value === selected)
        : undefined;

      // if selected is given and it is also found in the given options
      if (exists) {
        helpers.setValue(exists.value);
      } else {
        helpers.setValue(options[0].value);
      }
    }
  }, [options]);

  return (
    <div className={`flex flex-col mb-6 ${classes}`}>
      <div
        className={`form-group flex ${
          inline ? " flex-row items-center" : "flex-col justify-center"
        }`}
      >
        <label
          className={`font-medium ${inline ? "mr-4 w-28" : "mb-2"}`}
          htmlFor={id}
        >
          {label}
        </label>
        <select
          disabled={options.length === 0}
          {...field}
          {...props}
          className={`border ${
            meta.touched && meta.error
              ? "border-red-400 "
              : "border-coolGray-200 "
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {meta.touched && meta.error && <ErrorBox msg={meta.error} />}
    </div>
  );
};

export default Select;
