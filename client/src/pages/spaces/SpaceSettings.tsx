import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import Error from "../../components/Error/Error";
import Loader from "../../components/Loader/Loader";
import { addToast } from "../../redux/features/toastSlice";
import { SettingsObj } from "../../types";
import {
  CONFIRM_DELETE_SPACE_MODAL,
  ERROR,
  SPACE_ROLES,
  SUCCESS,
  WARNING,
} from "../../types/constants";
import * as Yup from "yup";
import Input from "../../components/FormikComponents/Input";
import TextArea from "../../components/FormikComponents/TextArea";
import SubmitBtn from "../../components/FormikComponents/SubmitBtn";
import FileInput from "../../components/FormikComponents/FileInput";
import { showModal } from "../../redux/features/modalSlice";

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
    return <Navigate to={`/s/${spaceId}/`} replace={true} />;
  }

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (settings: SettingsObj) => {
      const formData = new FormData();

      if (Object.keys(settings).includes("name")) {
        formData.append("name", settings.name);
      }

      if (Object.keys(settings).includes("description")) {
        formData.append("description", settings.description);
      }

      if (Object.keys(settings).includes("icon")) {
        formData.append("icon", settings.icon);
      }

      setIsSubmitting(true);

      axiosInstance
        .put(`/spaces/${spaceId}/settings`, formData, {
          headers: {
            ContentType: "multipart/form-data",
          },
        })
        .then((response) => {
          const { message } = response.data;

          dispatch(
            addToast({
              kind: SUCCESS,
              msg: message,
            })
          );

          queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
          queryClient.invalidateQueries(["getSpaces"]);
          queryClient.invalidateQueries(["getFavorites"]);

          setIsSubmitting(false);
        })
        .catch((error) => {
          setIsSubmitting(false);

          // req was made and server responded with error
          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 404:
                dispatch(addToast({ kind: ERROR, msg: message }));
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                // redirect them to home page
                navigate("/", { replace: true });
                break;
              case 403:
                dispatch(addToast({ kind: ERROR, msg: message }));
                navigate(`/s/${spaceId}/`, { replace: true });
                break;
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
    },
    [spaceId]
  );

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
      <div className="h-full w-full flex items-center justify-center">
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

  const initialValues: SettingsObj = {
    name: settings?.name ? settings.name : "",
    description: settings?.description ? settings.description : "",
    icon: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(100, "Space name should be less than or equal to 100 chars")
      .required("Space name is required"),
    description: Yup.string().max(
      255,
      "Space description should be less than or equal to 255 chars"
    ),
    icon: Yup.mixed()
      .test("fileSize", "File Size is too large", (value) =>
        value ? value.size <= 1024 * 1024 * 2 : true
      )
      .test("fileType", "Unsupported File Format", (value) =>
        value
          ? ["image/jpg", "image/jpeg", "image/png"].includes(value.type)
          : true
      ),
  });

  return (
    <div className="space-settings px-8 py-6 border-t ">
      <div className="space-container">
        {settings && (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form className="w-3/5 max-w-4xl">
              <FileInput
                label="Space Icon"
                id="icon"
                name="icon"
                optional={false}
                disabled={myRole !== SPACE_ROLES.ADMIN}
              />
              <Input
                label="Space name"
                id="name"
                name="name"
                type="text"
                optional={false}
                disabled={myRole !== SPACE_ROLES.ADMIN}
              />
              <TextArea
                label="Description"
                id="description"
                disabled={myRole !== SPACE_ROLES.ADMIN}
                name="description"
              />

              <div className="buttons flex justify-center items-center">
                <div className="w-44">
                  <SubmitBtn
                    text="Save"
                    disabled={myRole !== SPACE_ROLES.ADMIN}
                    classes="mb-4 w-full mt-4"
                    noDirtyCheck={myRole !== SPACE_ROLES.ADMIN}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>

              {myRole === SPACE_ROLES.ADMIN && (
                <button
                  type="button"
                  className="my-2 font-medium text-red-500 underline"
                  onClick={() =>
                    dispatch(
                      showModal({
                        modalType: CONFIRM_DELETE_SPACE_MODAL,
                        modalProps: {
                          spaceId: spaceId,
                        },
                        modalTitle: "Are you sure want to delete this Space?",
                      })
                    )
                  }
                >
                  Delete this Space
                </button>
              )}
            </Form>
          </Formik>
        )}
      </div>
    </div>
  );
};

export default SpaceSettings;
