import { Form, Formik } from "formik";
import React, { useCallback } from "react";
import { useState } from "react";
import { useQuery } from "react-query";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import axiosInstance from "../../axiosInstance";
import { Option } from "../../types";
import { BOARD_VISIBILITY_TYPES } from "../../types/constants";
import BoardBackground from "../FormikComponents/BoardBackground";
import Input from "../FormikComponents/Input";
import RemoteSelect from "../FormikComponents/RemoteSelect";
import Select from "../FormikComponents/Select";
import SubmitBtn from "../FormikComponents/SubmitBtn";

interface SpaceResponseObj {
  name: string;
  _id: string;
}

interface BoardObj {
  spaceId: string;
  name: string;
  bgImg: string;
  color: string;
  visibility: string;
}

interface Props {
  spaceId?: string;
}

const CreateBoardModal = ({ spaceId }: Props) => {
  const dispatch = useDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const boardVisibilityOptions = [
    {
      value: BOARD_VISIBILITY_TYPES.PUBLIC,
      label: "Public - All members of this workspace can see & edit this board",
    },
    {
      value: BOARD_VISIBILITY_TYPES.PRIVATE,
      label:
        "Private - Board members and workspace admins can see & edit this board",
    },
  ];

  const getMySpaces = async () => {
    const response = await axiosInstance.get("/spaces/mine");

    const { data } = response.data;

    return data.map((space: SpaceResponseObj) => ({
      value: space._id,
      label: space.name,
    }));
  };

  const { data, isLoading, isFetching, error } = useQuery<
    Option[] | undefined,
    any,
    Option[],
    string[]
  >(["getMySpaces"], getMySpaces);

  const initialValues: BoardObj = {
    spaceId: "",
    name: "",
    bgImg: "",
    color: "",
    visibility: "",
  };

  const validationSchema = Yup.object({
    spaceId: Yup.string().required("Space is required"),
    name: Yup.string()
      .max(512, "Board name should be less than or equal to 512 chars")
      .required("Board name is required"),
    bgImg: Yup.string(),
    color: Yup.string()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code")
      .required("Color is required"),
    visibility: Yup.string().oneOf(
      Object.values(BOARD_VISIBILITY_TYPES),
      "Invalid board visibility type"
    ),
  });

  const handleSubmit = useCallback((board: BoardObj) => {
    console.log(board);
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => handleSubmit(values)}
    >
      <Form
        className="p-4 pl-6 pb-6 mt-4 mr-2"
        style={{
          maxWidth: "34rem",
        }}
      >
        {/* bg & color */}
        <BoardBackground label="Background" fieldNames={["bgImg", "color"]} />

        <Input
          label="Board title"
          id="name"
          name="name"
          type="text"
          autoFocus={true}
          optional={false}
        />
        <RemoteSelect
          id="spaceId"
          name="spaceId"
          label="Workspace"
          error={error}
          isFetching={isFetching}
          isLoading={isLoading}
          options={data || []}
          queryKey={["getMySpaces"]}
          selected={spaceId}
        />

        <Select
          id="visibility"
          name="visibility"
          label="Visibility"
          options={boardVisibilityOptions}
        />

        <div className="buttons w-full flex items-center text-sm">
          <SubmitBtn text="Create" classes="mb-4" isSubmitting={isSubmitting} />
        </div>
      </Form>
    </Formik>
  );
};

export default CreateBoardModal;
