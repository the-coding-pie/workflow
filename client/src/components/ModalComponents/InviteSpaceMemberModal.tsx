import { AxiosError } from "axios";
import debounce from "debounce-promise";
import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axiosInstance from "../../axiosInstance";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { ERROR, SUCCESS } from "../../types/constants";
import CustomOption from "../CustomOption/CustomOption";
import SelectDropDownAsync from "../FormikComponents/SelectDropDownAsync";
import SubmitBtn from "../FormikComponents/SubmitBtn";

interface UserObj {
  _id: string;
  username: string;
  profile: string;
  isMember: string;
}

interface MembersObj {
  members: any[];
}

interface Props {
  spaceId: string;
}

const InviteSpaceMemberModal = ({ spaceId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: MembersObj = {
    members: [],
  };

  const validationSchema = Yup.object({
    members: Yup.array(
      Yup.object({
        value: Yup.string().required(),
        label: Yup.string().required(),
        profile: Yup.string().required(),
      })
    ),
  });

  const handleSubmit = useCallback(
    ({ members }: MembersObj) => {
      const value = {
        members: members.map((m) => m.value),
      };

      setIsSubmitting(true);

      axiosInstance
        .put(`/spaces/${spaceId}/members/bulk`, value, {
          headers: {
            ContentType: "application/json",
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

          queryClient.invalidateQueries(["getSpaceMembers", spaceId]);

          setIsSubmitting(false);

          dispatch(hideModal());
        })
        .catch((error: AxiosError) => {
          setIsSubmitting(false);

          if (error.response) {
            const response = error.response;
            const { message } = response.data;

            switch (response.status) {
              case 404:
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));
                queryClient.invalidateQueries(["getSpaces"]);
                queryClient.invalidateQueries(["getFavorites"]);
                // redirect them to home page
                navigate("/", { replace: true });
                break;
              case 400:
              case 403:
                dispatch(hideModal());
                dispatch(addToast({ kind: ERROR, msg: message }));
                break;
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

  const searchUsers = async (query: string) => {
    if (query) {
      const response = await axiosInstance.get(
        `/users/search?q=${query}&spaceId=${spaceId}`
      );

      const { data } = response.data;

      return data.map((user: UserObj) => {
        return {
          value: user._id,
          label: user.username,
          profile: user.profile,
          isDisabled: Object.keys(user).includes("isMember")
            ? user.isMember
            : false,
        };
      });
    }
  };

  const delayLoadUsers = useCallback(debounce(searchUsers, 300), [spaceId]);

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
        <div
          className="flex flex-col justify-between"
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
            autoFocus={true}
          />

          <div className="buttons w-full flex flex-col text-sm">
            <SubmitBtn
              text="Invite"
              classes="mb-4"
              isSubmitting={isSubmitting}
            />

            <button
              className="text-slate-600"
              onClick={() => dispatch(hideModal())}
            >
              Cancel
            </button>
          </div>
        </div>
      </Form>
    </Formik>
  );
};

export default InviteSpaceMemberModal;
