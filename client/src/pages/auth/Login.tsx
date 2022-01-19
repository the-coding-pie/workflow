import React, { useCallback, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import Input from "../../components/FormikComponents/Input";
import ErrorBox from "../../components/FormikComponents/ErrorBox";
import SubmitBtn from "../../components/FormikComponents/SubmitBtn";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AxiosError } from "axios";
import { loginUser } from "../../redux/features/authSlice";
import GoogleAuthBtn from "../../components/GoogleAuth/GoogleAuthBtn";
import axiosInstance from "../../axiosInstance";

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
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = useCallback((user: UserObj) => {
    setIsSubmitting(true);

    axiosInstance
      .post(`/auth/login`, user, {
        headers: {
          ContentType: "application/json",
        },
      })
      .then((response) => {
        const { data } = response.data;

        setCommonError("");

        setIsSubmitting(false);

        dispatch(
          loginUser({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );
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
      <Form
        className="max-w-sm flex flex-col justify-center items-center bg-white px-6 py-5 shadow"
        style={{
          minWidth: "360px",
        }}
      >
        {commonError && (
          <div className="common-error mt-2 mb-3 text-center">
            <ErrorBox msg={commonError} />
          </div>
        )}
        <GoogleAuthBtn
          setCommonError={setCommonError}
          setIsSubmitting={setIsSubmitting}
        />

        <div className="my-5 text-sm font-bold text-gray-400">OR</div>

        <Input label="Email" id="email" name="email" type="email" />
        <Input label="Password" id="password" name="password" type="password" />

        <div className="buttons flex items-center w-full justify-center my-4 mb-6">
          <SubmitBtn
            text="Login"
            isSubmitting={isSubmitting}
            classes="text-sm"
          />
        </div>

        <div className="forgot-password mb-4 text-sm">
          <Link to="/forgot-password" className="text-primary">
            Forgot Password?
          </Link>
        </div>

        <p className="text-gray-500 text-sm">
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
