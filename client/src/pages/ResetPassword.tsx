import { AxiosError } from "axios";
import { Form, Formik } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import axiosInstance from "../axiosInstance";
import ErrorBox from "../components/FormikComponents/ErrorBox";
import Input from "../components/FormikComponents/Input";
import SubmitBtn from "../components/FormikComponents/SubmitBtn";
import { FORGOT_PASSWORD_TOKEN_LENGTH } from "../config";
import { RootState } from "../redux/app";
import {
  loginUser,
  logoutUser,
  setEmailVerified,
} from "../redux/features/authSlice";
import { addToast } from "../redux/features/toastSlice";
import { ERROR } from "../types/constants";

interface PasswordObj {
  password: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();

  const params = useParams();

  const dispatch = useDispatch();

  let token: string | undefined = "";

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    token = params.token;

    if (!token || token.length !== FORGOT_PASSWORD_TOKEN_LENGTH) {
      dispatch(
        addToast({
          kind: ERROR,
          msg: "Sorry, your password reset link has expired or is malformed",
        })
      );
      // if authenticated
      if (accessToken || refreshToken) {
        navigate("/", { replace: true });
      } else {
        navigate("/forgot-password", { replace: true });
      }
    }
  }, []);

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password should be min 8 chars long")
      .matches(/\d/, "Password must contain at least one number")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Passwords must match"),
  });

  const handleSubmit = useCallback((passwordObj: PasswordObj) => {
    setIsSubmitting(true);

    axiosInstance
      .post(`/accounts/reset-password/${token}`, passwordObj)
      .then((response) => {
        const { data } = response.data;
        
        setIsSubmitting(false);

        dispatch(
          loginUser({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          })
        );

        navigate("/", { replace: true });
      })
      .catch((error: AxiosError) => {
        setIsSubmitting(false);

        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 404:
              dispatch(addToast({ kind: ERROR, msg: message }));
              // if authenticated
              if (accessToken || refreshToken) {
                navigate("/", { replace: true });
              } else {
                navigate("/forgot-password", { replace: true });
              }
              break;
            case 400:
            case 500:
              dispatch(addToast({ kind: ERROR, msg: message }));
              break;
            default:
              dispatch(
                addToast({ kind: ERROR, msg: "Oops, something went wrong" })
              );
              break;
          }
        } else if (error.request) {
          dispatch(
            addToast({ kind: ERROR, msg: "Oops, something went wrong" })
          );
        } else {
          dispatch(addToast({ kind: ERROR, msg: `Error: ${error.message}` }));
        }
      });
  }, [token]);

  return (
    <div className="auth-second w-screen h-screen overflow-y-auto flex items-center justify-center bg-blue-50">
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
          <h3 className="text-2xl font-bold mb-6 text-center">
            Choose a new <br /> password
          </h3>

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
          />
          <Input
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
          />

          <div className="buttons flex flex-col items-center w-full justify-center mt-6">
            <SubmitBtn
              text="Submit"
              isSubmitting={isSubmitting}
              classes="text-sm mb-4"
            />

            {!accessToken && !refreshToken && (
              <button
                type="button"
                className="text-primary cursor-pointer text-sm"
                onClick={(e) => {
                  e.preventDefault();

                  navigate("/auth/login");
                }}
              >
                Back to Log in
              </button>
            )}
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default ResetPassword;
