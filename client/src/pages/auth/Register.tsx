import React, { useCallback, useState } from "react";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import SubmitBtn from "../../components/FormikComponents/SubmitBtn";
import ErrorBox from "../../components/FormikComponents/ErrorBox";
import Input from "../../components/FormikComponents/Input";
import { Form, Formik } from "formik";

interface UserObj {
  username: string;
  email: string;
  password: string;
}

const Register = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValues: UserObj = {
    username: "",
    email: "",
    password: "",
  };
  const [commonError, setCommonError] = useState("");

  const validationSchema = Yup.object({
    username: Yup.string()
      .matches(
        /^[A-Za-z0-9_-]*$/,
        "Username must only contain letters, numbers, underscores and dashes"
      )
      .required("Username is required"),
    email: Yup.string().email("Invalid Email").required("Email is required"),
    password: Yup.string()
      .min(8, "Password should be min 8 chars long")
      .matches(/\d/, "Password must contain at least one number")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter")
      .required("Password is required"),
  });

  // register user
  const handleSubmit = useCallback((user: UserObj) => {}, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => handleSubmit(values)}
    >
      <Form className="w-80 max-w-sm flex flex-col justify-center items-center bg-white px-6 py-4 shadow">
        <h3 className="font-semibold text-2xl mb-4">Register</h3>
        <Input label="Username" id="username" name="username" type="text" />
        <Input label="Email" id="email" name="email" type="email" />
        <Input label="Password" id="password" name="password" type="password" />

        {commonError && (
          <div className="common-error mt-3 text-center">
            <ErrorBox msg={commonError} />
          </div>
        )}

        <div className="buttons flex items-center w-full justify-center my-4 mb-6">
          <SubmitBtn
            text="Register"
            isSubmitting={isSubmitting}
            classes="text-sm"
          />
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-link">
            Login
          </Link>{" "}
        </p>
      </Form>
    </Formik>
  );
};

export default Register;
