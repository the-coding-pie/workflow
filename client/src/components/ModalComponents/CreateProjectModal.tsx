import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import Input from "../FormikComponents/Input";
import NextBtn from "../FormikComponents/NextBtn";
import TextArea from "../FormikComponents/TextArea";

interface ProjectObj {
  name: string;
  description: string;
  members: string[];
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
    members: Yup.array(Yup.string()),
  });

  const handleSubmit = useCallback((project: ProjectObj) => {
    console.log(project);
  }, []);

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
          <div className="second-page flex flex-col"></div>
        )}
      </Form>
    </Formik>
  );
};

export default CreateProjectModal;
