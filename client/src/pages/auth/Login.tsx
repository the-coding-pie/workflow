import React, { useCallback, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import Input from "../../components/FormikComponents/Input";
import ErrorBox from "../../components/FormikComponents/ErrorBox";
import SubmitBtn from "../../components/FormikComponents/SubmitBtn";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios, { AxiosError } from "axios";
import { loginUser } from "../../redux/features/authSlice";

interface UserObj {
  email: string;
  password: string;
}

const Login = () => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initalValues: UserObj = {
    email: "",
    password: "",
  };
  const [commonError, setCommonError] = useState("");

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid Email").required("Email is required"),
    password: Yup.string()
      .min(8, "Password should be min 8 chars long")
      .matches(/\d/, "Password must contain at least one number")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter")
      .required("Password is required"),
  });

  const handleSubmit = useCallback((user: UserObj) => {
    setIsSubmitting(true);

    axios
      .post(`/auth/login`, user, {
        headers: {
          ContentType: "application/json",
        },
      })
      .then((response) => {
        const { data } = response.data;

        setCommonError("");

        dispatch(
          loginUser({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );

        setIsSubmitting(false);
      })
      .catch((error: AxiosError) => {
        setIsSubmitting(false);

        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            // bad request or invalid format or unauthorized
            case 400:
            case 401:
            case 500:
              setCommonError(message);
              break;
            default:
              setCommonError("Oops, something went wrong");
              break;
          }
        } else if (error.request) {
          setCommonError("Oops, something went wrong");
        } else {
          setCommonError(`Error: ${error.message}`);
        }
      });
  }, []);

  return (
    <Formik
      initialValues={initalValues}
      validationSchema={validationSchema}
      onSubmit={(values) => handleSubmit(values)}
    >
      <Form className="w-80 max-w-sm flex flex-col justify-center items-center bg-white px-6 py-4 shadow">
        <h3 className="font-semibold text-2xl mb-4">Login</h3>
        <Input label="Email" id="email" name="email" type="email" />
        <Input label="Password" id="password" name="password" type="password" />

        {commonError && (
          <div className="common-error mt-3 text-center">
            <ErrorBox msg={commonError} />
          </div>
        )}

        <div className="buttons flex items-center w-full justify-center my-4 mb-6">
          <SubmitBtn
            text="Login"
            isSubmitting={isSubmitting}
            classes="text-sm"
          />
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Don't have an account?{" "}
          <Link to="/auth/register" className="text-primary">
            Register
          </Link>
        </p>
      </Form>
    </Formik>
  );
};

export default Login;
