import { useField } from "formik";
import React from "react";
import AsyncSelect from "react-select/async";
import ErrorBox from "./ErrorBox";

interface Props {
  label: string;
  id: string;
  name: string;
  loadOptions: (val: string) => Promise<any>;
  components?: Object;
  isMulti?: boolean;
  optional?: boolean;
  inline?: boolean;
  classes?: string;
}

const customStyles = {
  control: (provided: any, state: any) => {
    return {
      ...provided,
      borderWidth: 2,
      boxShadow: "none",
      ":hover": {
        borderColor: "#8b5cf6",
        cursor: "text",
      },
      borderColor: "#ddd6fe",
    };
  },
};

const SelectDropDownAsync = ({
  label,
  id,
  name,
  loadOptions,
  classes,
  components = {},
  isMulti = false,
  optional = false,
  inline = false,
}: Props) => {
  const [field, meta, helpers] = useField({ name });
  
  return (
    <div className={`flex flex-col w-full mb-6 ${classes}`}>
      <div
        className={`form-group flex ${
          inline ? " flex-row items-center" : "flex-col justify-center"
        }`}
      >
        <label
          className={`font-medium text-sm ${inline ? "mr-2 w-28" : "mb-2"}`}
          htmlFor={id}
        >
          {label}{" "}
          {optional && (
            <span className="optional text-slate-400">(Optional)</span>
          )}
        </label>

        <AsyncSelect
          styles={customStyles}
          className="text-sm"
          isMulti={isMulti}
          components={components}
          loadOptions={loadOptions}
          onChange={(value: any) => {
            helpers.setValue(value);
          }}
          value={field.value}
        />
      </div>
      {meta.touched && meta.error && <ErrorBox msg={meta.error} />}
    </div>
  );
};

export default SelectDropDownAsync;
