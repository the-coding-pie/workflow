import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { BOARD_VISIBILITY_TYPES } from "../../types/constants";

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
    bgImg: Yup.string().matches(
      /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
      "Invalid url for image"
    ),
    color: Yup.string()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color hex code")
      .required("Color is required"),
    visibility: Yup.string().oneOf(
      Object.values(BOARD_VISIBILITY_TYPES),
      "Invalid board visibility type"
    ),
  });

  return <div>Create Board</div>;
};

export default CreateBoardModal;
