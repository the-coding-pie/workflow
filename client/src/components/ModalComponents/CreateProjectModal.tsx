import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import Input from "../FormikComponents/Input";
import NextBtn from "../FormikComponents/NextBtn";
import TextArea from "../FormikComponents/TextArea";
import AsyncSelect from "react-select/async";
import debounce from "debounce-promise";
import axios from "axios";
import CustomOption from "../CustomOption/CustomOption";
import SelectDropDownAsync from "../FormikComponents/SelectDropDownAsync";
import SubmitBtn from "../FormikComponents/SubmitBtn";

interface ProjectObj {
  name: string;
  description: string;
  members: any[];
}

interface UserObj {
  _id: string;
  username: string;
  profile: string;
}

const CreateProjectModal = () => {
  const dispatch = useDispatch();

  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: ProjectObj = {
    name: "",
    description: "",
    members: [],
  };
  const validationSchema = Yup.object({
    name: Yup.string()
      .max(100, "Project name should be less than or equal to 100 chars")
      .required("Project name is required"),
    description: Yup.string().max(
      255,
      "Project description should be less than or equal to 255 chars"
    ),
    members: Yup.array(
      Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
        profile: Yup.string().required(),
      })
    ),
  });

  const handleSubmit = useCallback((project: ProjectObj) => {
    const value = {
      ...project,
      members: project.members.map((m) => m.value),
    };

    console.log(value)
  }, []);

  const searchUsers = async (query: string) => {
    if (query) {
      const response = await axios.get(`/users/search?q=${query}`);

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
      <Form className="p-4 pl-8 pb-6 mt-6">
        {isFirstPage ? (
          <div className="first-page flex flex-col">
            <Input
              label="Project name"
              id="name"
              name="name"
              type="text"
              optional={false}
            />
            <TextArea
              label="Project Description"
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
          <div className="second-page flex flex-col">
            <SelectDropDownAsync
              name="members"
              id="members"
              label="Project members"
              isMulti={true}
              loadOptions={loadUsers}
              components={{ Option: CustomOption }}
            />

            <div className="buttons w-full flex justify-end">
              <SubmitBtn text="Create" isSubmitting={isSubmitting} />
            </div>
          </div>
        )}
      </Form>
    </Formik>
  );
};

export default CreateProjectModal;
