import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/app";
import * as Yup from "yup";
import Input from "../components/FormikComponents/Input";
import SubmitBtn from "../components/FormikComponents/SubmitBtn";
import FileInput from "../components/FormikComponents/FileInput";
import axiosInstance from "../axiosInstance";
import { addToast } from "../redux/features/toastSlice";
import { ERROR, SUCCESS } from "../types/constants";
import { useQueryClient } from "react-query";

interface UserObj {
  username: string;
  profile: string;
  password: string;
}

const Settings = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { user } = useSelector((state: RootState) => state.auth);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: UserObj = {
    username: user!.username,
    profile: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(2, "Username should be at least 2 chars long")
      .matches(
        /^[A-Za-z0-9_-]*$/,
        "Username must only contain letters, numbers, underscores and dashes"
      )
      .required("Username is required"),
    password: Yup.string()
      .min(8, "Password should be min 8 chars long")
      .matches(/\d/, "Password must contain at least one number")
      .matches(/[a-zA-Z]/, "Password must contain at least one letter"),
    profile: Yup.mixed()
      .test("fileSize", "File Size is too large", (value) =>
        value ? value.size <= 1024 * 1024 * 2 : true
      )
      .test("fileType", "Unsupported File Format", (value) =>
        value
          ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type)
          : true
      ),
  });

  const handleSubmit = useCallback((user: UserObj, setFieldValue: any) => {
    const formData = new FormData();

    formData.append("username", user.username);
    formData.append("profile", user.profile);
    formData.append("password", user.password);

    setIsSubmitting(true);

    axiosInstance
      .put(`/accounts`, formData, {
        headers: {
          ContentType: "multipart/form-data",
        },
      })
      .then((response) => {
        const { message } = response.data;

        setFieldValue("username", user.username);
        setFieldValue("password", "");
        setFieldValue("profile", "");

        dispatch(
          addToast({
            kind: SUCCESS,
            msg: message,
          })
        );

        queryClient.invalidateQueries(["getCurrentUser"]);

        setIsSubmitting(false);
      })
      .catch((error) => {
        setIsSubmitting(false);

        // req was made and server responded with error
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 400:
            case 500:
              dispatch(
                addToast({
                  kind: ERROR,
                  msg: message,
                })
              );
              break;
            default:
              // server error
              dispatch(
                addToast({
                  kind: ERROR,
                  msg: "Oops, something went wrong",
                })
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
  }, []);

  return (
    <div className="profile-settings mt-8">
      <div className="space-container">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setFieldValue }) =>
            handleSubmit(values, setFieldValue)
          }
        >
          <Form
            className="ml-8"
            style={{
              maxWidth: "400px",
            }}
          >
            <div className="right flex-1">
              <FileInput id="profile" name="profile" label="Profile Img" />

              <Input
                label="Username"
                id="username"
                name="username"
                type="text"
              />
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
              />

              <div className="buttons flex items-center w-full justify-center my-4 mb-6">
                <SubmitBtn
                  text="Save"
                  isSubmitting={isSubmitting}
                  noDirtyCheck={true}
                  classes="text-sm"
                />
              </div>
            </div>
          </Form>
        </Formik>
      </div>
    </div>
  );
};

export default Settings;
