import debounce from "debounce-promise";
import { Form, Formik } from "formik";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import axiosInstance from "../../axiosInstance";
import { hideModal } from "../../redux/features/modalSlice";
import CustomOption from "../CustomOption/CustomOption";
import SelectDropDownAsync from "../FormikComponents/SelectDropDownAsync";
import SubmitBtn from "../FormikComponents/SubmitBtn";

interface UserObj {
  _id: string;
  username: string;
  profile: string;
}

interface MembersObj {
  members: any[];
}

const InviteSpaceMemberModal = () => {
  const dispatch = useDispatch();

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

  const handleSubmit = useCallback(({ members }: MembersObj) => {
    const value = {
      members: members.map((m) => m.value),
    };

    console.log(value);
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
