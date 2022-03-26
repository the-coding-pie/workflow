import React, { useCallback, useState } from "react";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import SubmitBtn from "../../components/FormikComponents/SubmitBtn";
import ErrorBox from "../../components/FormikComponents/ErrorBox";
import Input from "../../components/FormikComponents/Input";
import { Form, Formik } from "formik";
import { AxiosError } from "axios";
import { loginUser, setEmailVerified } from "../../redux/features/authSlice";
import GoogleAuthBtn from "../../components/GoogleAuth/GoogleAuthBtn";
import axiosInstance from "../../axiosInstance";

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
      .min(2, "Username should be at least 2 chars long")
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
  const handleSubmit = useCallback((user: UserObj) => {
    setIsSubmitting(true);

    axiosInstance
      .post(`/auth/register`, user, {
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
            case 409:
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
      initialValues={initialValues}
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

        <Input label="Username" id="username" name="username" type="text" />
        <Input label="Email" id="email" name="email" type="email" />
        <Input label="Password" id="password" name="password" type="password" />

        <div className="buttons flex items-center w-full justify-center my-4 mb-6">
          <SubmitBtn
            text="Register"
            isSubmitting={isSubmitting}
            classes="text-sm"
          />
        </div>

        <p className="text-gray-500 text-sm">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary">
            Login
          </Link>{" "}
        </p>
      </Form>
    </Formik>
  );
};

export default Register;
