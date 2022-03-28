import { AxiosError } from "axios";
import { Form, Formik } from "formik";
import React, { useCallback } from "react";
import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axiosInstance from "../../axiosInstance";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { Option } from "../../types";
import { BOARD_VISIBILITY_TYPES, ERROR } from "../../types/constants";
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const boardVisibilityOptions = [
    {
      value: BOARD_VISIBILITY_TYPES.PUBLIC,
      label: "Public - All members of this space can see & edit this board",
    },
    {
      value: BOARD_VISIBILITY_TYPES.PRIVATE,
      label:
        "Private - Board members and space admins can see & edit this board",
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
  >(["getMySpaces"], getMySpaces, {
    staleTime: 0,
    cacheTime: 0,
  });

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

  const handleSubmit = useCallback(
    (board: BoardObj) => {
      setIsSubmitting(true);

      axiosInstance
        .post(`/boards`, board, {
          headers: {
            ContentType: "application/json",
          },
        })
        .then((response) => {
          const { data } = response.data;

          queryClient.invalidateQueries(["getSpaceBoards", data.spaceId]);

          // update existing spaces list
          queryClient.setQueryData([`getSpaces`], (oldData: any) => {
            if (data.spaceId) {
              return oldData.map((space: any) => {
                if (space._id === data.spaceId) {
                  return {
                    ...space,
                    boards: [
                      ...space.boards,
                      {
                        _id: data._id,
                        isMember: data.isMember,
                        name: data.name,
                        visibility: data.visibility,
                        isFavorite: data.isFavorite,
                        color: data.color,
                        role: data.role,
                      },
                    ],
                  };
                }
                return space;
              });
            } else {
              return oldData;
            }
          });

          setIsSubmitting(false);

          dispatch(hideModal());

          // redirect them to the created board
          navigate(`/b/${data._id}`);
        })
        .catch((error: AxiosError) => {
          setIsSubmitting(false);

          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 404:
              case 403:
                dispatch(addToast({ kind: ERROR, msg: message }));
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                if (queryClient.getQueryData(["getSpaceInfo", spaceId])) {
                  queryClient.invalidateQueries(["getSpaceInfo", spaceId]);
                }
                queryClient.invalidateQueries(["getRecentBoards"]);
                queryClient.invalidateQueries(["getAllMyCards"]);
                dispatch(hideModal());
                break;
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
    },
    [spaceId]
  );

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
