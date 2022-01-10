import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Input from "../../components/FormikComponents/Input";
import SubmitBtn from "../../components/FormikComponents/SubmitBtn";

interface EmailObj {
  email: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();

  const [isMsgScreen, setIsMsgScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: EmailObj = {
    email: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid Email").required("Email is required"),
  });

  const handleSubmit = useCallback(({ email }: EmailObj) => {
    console.log(email);

    // if success
    setIsMsgScreen(true);
  }, []);

  return !isMsgScreen ? (
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
          Enter your email to <br /> reset password
        </h3>

        <Input label="Email" id="email" name="email" type="email" />

        <div className="buttons flex flex-col items-center w-full justify-center mt-6">
          <SubmitBtn
            text="Reset Password"
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
            Cancel
          </button>
        </div>
      </Form>
    </Formik>
  ) : (
    <div
      className="max-w-sm flex flex-col justify-center items-center bg-white px-6 py-5 shadow"
      style={{
        minWidth: "360px",
      }}
    >
      <p className="mb-6">
        If an account exists for the email address, you will get an email with
        instructions on resetting your password. If it doesn't arrive, be sure
        to check your spam folder.
      </p>
      <Link to="/auth/login" className="text-primary text-sm">Back to Log in</Link>
    </div>
  );
};

export default ResetPassword;
