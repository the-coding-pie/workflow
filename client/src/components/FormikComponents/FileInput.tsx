import { useField } from "formik";
import { HiOutlineX } from "react-icons/hi";
import ErrorBox from "./ErrorBox";

interface Props {
  label: string;
  id: string;
  name: string;
  disabled?: boolean;
  autoFocus?: boolean;
  optional?: boolean;
  inline?: boolean;
  classes?: string;
}

const FileInput = ({
  label,
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
  const [field, meta, helpers] = useField({ name, type: "file" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target && e.target.files && e.target.files[0];

    if (file) {
      reader.readAsDataURL(file);
      helpers.setValue(file);
    }
  };

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

        <div className="flex items-center">
          <input
            disabled={disabled}
            autoFocus={autoFocus}
            className={`${
              meta.touched && meta.error
                ? "border-red-400 "
                : "border-slate-200 focus:border-primary"
            } mr-4 placeholder-transparent  disabled:opacity-80`}
            {...field}
            {...props}
            value={field.value ? field.value.current : ""}
            onChange={handleFileChange}
            id={id}
            type="file"
            accept="image/png, image/jpg, image/jpeg"
          />

          {field.value && (
            <button
              onClick={() => {
                helpers.setValue("");
              }}
            >
              <HiOutlineX size={18} />
            </button>
          )}
        </div>
      </div>
      {meta.touched && meta.error && <ErrorBox msg={meta.error} />}
    </div>
  );
};

export default FileInput;
