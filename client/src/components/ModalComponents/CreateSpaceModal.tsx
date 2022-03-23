import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import Input from "../FormikComponents/Input";
import NextBtn from "../FormikComponents/NextBtn";
import TextArea from "../FormikComponents/TextArea";
import debounce from "debounce-promise";
import { AxiosError } from "axios";
import CustomOption from "../CustomOption/CustomOption";
import SelectDropDownAsync from "../FormikComponents/SelectDropDownAsync";
import SubmitBtn from "../FormikComponents/SubmitBtn";
import { addToast } from "../../redux/features/toastSlice";
import { hideModal } from "../../redux/features/modalSlice";
import { ERROR } from "../../types/constants";
import axiosInstance from "../../axiosInstance";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

interface SpaceObj {
  name: string;
  description: string;
  members: any[];
}

interface UserObj {
  _id: string;
  username: string;
  profile: string;
}

const CreateSpaceModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: SpaceObj = {
    name: "",
    description: "",
    members: [],
  };
  const validationSchema = Yup.object({
    name: Yup.string()
      .max(100, "Space name should be less than or equal to 100 chars")
      .required("Space name is required"),
    description: Yup.string().max(
      255,
      "Space description should be less than or equal to 255 chars"
    ),
    members: Yup.array(
      Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
        profile: Yup.string().required(),
      })
    ),
  });

  const handleSubmit = useCallback((space: SpaceObj) => {
    const value = {
      ...space,
      members: space.members.map((m) => m.value),
    };

    setIsSubmitting(true);

    axiosInstance
      .post(`/spaces`, value, {
        headers: {
          ContentType: "application/json",
        },
      })
      .then((response) => {
        const { data } = response.data;

        // update existing spaces list
        queryClient.setQueryData([`getSpaces`], (oldData: any) => {
          return [...oldData, data];
        });

        setIsSubmitting(false);

        navigate(`/s/${data._id}/boards`);
        dispatch(hideModal());
      })
      .catch((error: AxiosError) => {
        setIsSubmitting(false);

        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
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
  }, []);

  const searchUsers = async (query: string) => {
    if (query) {
      const response = await axiosInstance.get(`/users/search?q=${query}`);

      const { data } = response.data;

      return data.map((user: UserObj) => {
        return {
          value: user._id,
          label: user.username,
          profile: user.profile,
        };
      });
    }
  };

  const delayLoadUsers = useCallback(debounce(searchUsers, 300), []);

  // return a promise which is the remote api call
  const loadUsers = (inputValue: string) => {
    return delayLoadUsers(inputValue);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => handleSubmit(values)}
    >
      <Form
        className="p-4 pl-8 pb-6 mr-4 mt-6"
        style={{
          minWidth: "34rem",
        }}
      >
        {isFirstPage ? (
          <div className="first-page flex flex-col">
            <div className="intro mb-7">
              <h3 className="text-xl font-semibold mb-1">
                Let's create a Space
              </h3>
              <p
                className="text-base text-slate-600 "
                style={{
                  lineHeight: "1.4rem",
                }}
              >
                Group all your related boards under one space,
                <br /> so that it becames easier to access it.
              </p>
            </div>
            <Input
              label="Space name"
              id="name"
              name="name"
              type="text"
              autoFocus={true}
              optional={false}
            />
            <TextArea
              label="Space Description"
              id="description"
              name="description"
              optional={true}
            />

            <div className="buttons w-full flex justify-end">
              <NextBtn
                text="Continue"
                fieldsOnPage={["name", "description"]}
                onClick={() => setIsFirstPage(false)}
              />
            </div>
          </div>
        ) : (
          <div
            className="second-page flex flex-col justify-between"
            style={{
              minHeight: "14rem",
            }}
          >
            <SelectDropDownAsync
              name="members"
              id="members"
              label="Space members"
              isMulti={true}
              loadOptions={loadUsers}
              components={{ Option: CustomOption }}
              optional={true}
              autoFocus={true}
            />

            <div className="buttons w-full flex flex-col text-sm">
              <SubmitBtn
                text="Create"
                classes="mb-4"
                isSubmitting={isSubmitting}
              />

              <button
                className="underline text-gray-700"
                onClick={() => setIsFirstPage(true)}
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </Form>
    </Formik>
  );
};

export default CreateSpaceModal;
