import { useField } from "formik";
import ErrorBox from "./ErrorBox";

interface Props {
  label: string;
  type: string;
  id: string;
  name: string;
}

const Input = ({ label, type, id, name }: Props) => {
  //   field -> { name: string, value: string, onChange: () => {}, onBlur: () => {} }
  //   meta -> { touched: boolean, error: string, ... }
  const [field, meta] = useField(name);

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input {...field} id={id} type={type} />
      {meta.touched && meta.error && <ErrorBox msg={meta.error} />}
    </div>
  );
};

export default Input;
