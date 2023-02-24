import { useField } from "formik";
import ErrorBox from "./ErrorBox";

interface Props {
  label: string;
  type: string;
  id: string;
  name: string;
  disabled?: boolean;
  autoFocus?: boolean;
  optional?: boolean;
  inline?: boolean;
  classes?: string;
}

const Input = ({
  label,
  type,
  id,
  name,
  classes,
  disabled = false,
  autoFocus = false,
  optional = false,
  inline = false,
  ...props
}: Props) => {
  //   field -> { name: string, value: string, onChange: () => {}, onBlur: () => {} }
  //   meta -> { touched: boolean, error: string, ... }
  const [field, meta] = useField({ name, type });

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

        <input
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="false"
          className={`${
            meta.touched && meta.error
              ? "border-red-400 "
              : "border-slate-200 focus:border-primary"
          }   placeholder-transparent  disabled:opacity-80`}
          {...field}
          {...props}
          id={id}
          type={type}
        />
      </div>
      {meta.touched && meta.error && <ErrorBox msg={meta.error} />}
    </div>
  );
};

export default Input;
