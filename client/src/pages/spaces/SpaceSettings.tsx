import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import Error from "../../components/Error/Error";
import Loader from "../../components/Loader/Loader";
import { addToast } from "../../redux/features/toastSlice";
import { SettingsObj } from "../../types";
import { ERROR, SPACE_ROLES, WARNING } from "../../types/constants";
import * as Yup from "yup";
import Input from "../../components/FormikComponents/Input";
import TextArea from "../../components/FormikComponents/TextArea";
import SubmitBtn from "../../components/FormikComponents/SubmitBtn";

interface SpaceObj {
  name: string;
  description: string;
  icon: string;
}

interface Props {
  spaceId: string;
  myRole:
    | typeof SPACE_ROLES.ADMIN
    | typeof SPACE_ROLES.NORMAL
    | typeof SPACE_ROLES.GUEST;
}

const SpaceSettings = ({ spaceId, myRole }: Props) => {
  const dispatch = useDispatch();

  if (myRole !== SPACE_ROLES.ADMIN && myRole !== SPACE_ROLES.NORMAL) {
    dispatch(
      addToast({
        kind: WARNING,
        msg: "You don't have permission to access.",
      })
    );
    return <Navigate to={`/s/${spaceId}/`} />;
  }

  // if you reached here, then you must be an ADMIN or a NORMAL
  const getSpaceSettings = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/spaces/${queryKey[1]}/settings`);

    const { data } = response.data;

    return data;
  };

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery<SettingsObj | undefined, any, SettingsObj, string[]>(
    ["getSpaceSettings", spaceId],
    getSpaceSettings
  );

  if (isLoading) {
    return (
      <div className="h-full pb-12 w-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // handle each error accordingly & specific to that situation
  if (error) {
    if (error?.response) {
      const response = error.response;
      const { message } = response.data;

      switch (response.status) {
        case 403:
          dispatch(addToast({ kind: ERROR, msg: message }));
          // redirect them to home page
          return <Navigate to={`/s/${spaceId}/`} replace={true} />;
        case 400:
        case 404:
          dispatch(addToast({ kind: ERROR, msg: message }));
          // redirect them to home page
          return <Navigate to="/" replace={true} />;
        case 500:
          return <Error msg={message} />;
        default:
          return <Error msg={"Oops, something went wrong."} />;
      }
    } else if (error?.request) {
      return (
        <Error
          msg={"Oops, something went wrong, Unable to get response back."}
        />
      );
    } else {
      return <Error msg={`Oops, something went wrong.`} />;
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: SpaceObj = {
    name: settings?.name ? settings.name : "",
    description: settings?.icon ? settings.icon : "",
    icon: settings?.icon ? settings.icon : "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(100, "Space name should be less than or equal to 100 chars")
      .required("Space name is required"),
    description: Yup.string().max(
      255,
      "Space description should be less than or equal to 255 chars"
    ),
    icon: Yup.string(),
  });

  const handleSubmit = useCallback((settings: SettingsObj) => {}, []);

  return (
    <div className="space-settings px-8 py-6 border-t bg-white">
      {settings && (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => handleSubmit(values)}
        >
          <Form className="w-full">
            <Input
              label="Space name"
              id="name"
              name="name"
              type="text"
              optional={false}
            />
            <TextArea label="Description" id="description" name="description" />

            <div className="buttons flex justify-center items-center">
              <SubmitBtn
                text="Create"
                classes="mb-4 w-44 mt-4"
                isSubmitting={isSubmitting}
              />
            </div>
          </Form>
        </Formik>
      )}
    </div>
  );
};

export default SpaceSettings;
