import { useField } from "formik";
import React, { useEffect } from "react";
import { HiOutlineRefresh } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { Option } from "../../types";
import UtilityBtn from "../UtilityBtn/UtilityBtn";
import ErrorBox from "./ErrorBox";

interface Props {
  label: string;
  id: string;
  name: string;
  isLoading: boolean;
  isFetching: boolean;
  queryKey: string[];
  error: any;
  options: Option[];
  selected?: string;
  inline?: boolean;
  classes?: string;
}

const RemoteSelect = ({
  label,
  id,
  name,
  queryKey,
  isFetching,
  isLoading,
  error,
  options = [],
  selected,
  classes,
  inline,
  ...props
}: Props) => {
  const queryClient = useQueryClient();

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
        <div className="flex">
          <select
            {...field}
            {...props}
            disabled={isLoading && options.length === 0}
            className={`border ${
              meta.touched && meta.error
                ? "border-red-400"
                : "border-coolGray-200 "
            } mr-2`}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <UtilityBtn
            uniqueId="remote-select-retry"
            Icon={HiOutlineRefresh}
            label="Retry"
            iconClasses={isFetching ? "animate-spin" : ""}
            onClick={() => {
              queryClient.invalidateQueries(queryKey);
            }}
          />
        </div>
      </div>
      {error ? (
        <ErrorBox msg={"Something went wrong, retry"} />
      ) : (
        meta.touched &&
        meta.error &&
        !isFetching && <ErrorBox msg={meta.error} />
      )}
    </div>
  );
};

export default RemoteSelect;
