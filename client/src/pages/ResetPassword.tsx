import { Form, Formik } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import Input from "../components/FormikComponents/Input";
import SubmitBtn from "../components/FormikComponents/SubmitBtn";
import { FORGOT_PASSWORD_TOKEN_LENGTH } from "../config";
import { RootState } from "../redux/app";

interface PasswordObj {
  password: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();

  const params = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { accessToken, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const token = params.token;

    if (!token || token.length !== FORGOT_PASSWORD_TOKEN_LENGTH) {
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

  const handleSubmit = useCallback(({ password }: PasswordObj) => {
    console.log(password);
  }, []);

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
          </div>
        </Form>
      </Formik>
    </div>
  );
};

export default ResetPassword;
