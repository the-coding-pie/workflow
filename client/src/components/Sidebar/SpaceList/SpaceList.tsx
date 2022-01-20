import { HiOutlineRefresh } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../../axiosInstance";
import spaces from "../../../data/spaces";
import { showModal } from "../../../redux/features/modalSlice";
import { SpaceObj } from "../../../types";
import { CREATE_SPACE_MODAL } from "../../../types/constants";
import UtilityBtn from "../../UtilityBtn/UtilityBtn";
import SpaceItem from "./SpaceItem";

const SpaceList = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const getSpaces = async () => {
    const response = await axiosInstance.get(`/spaces`);
    const { data } = response.data;

    return data;
  };

  const { data, isLoading, error } = useQuery<
    SpaceObj[] | undefined,
    any,
    SpaceObj[],
    string[]
  >(["getSpaces"], getSpaces);

  if (error) {
    return (
      <div
        className="w-full flex items-center justify-center text-sm"
        style={{
          height: "25rem",
        }}
      >
        <div className="flex items-center justify-center">
          <span className="mr-1">Unable to get data. </span>
          <button
            type="button"
            className="text-primary"
            onClick={() => {
              queryClient.invalidateQueries(["getSpaces"]);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{
          height: "25rem",
        }}
      >
        <svg
          className="animate-spin h-8 w-8 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="text-primary"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <ul className="space-list pb-2">
      {data && data.length > 0 ? (
        data.map((space) => {
          return <SpaceItem key={space._id} space={space} />;
        })
      ) : (
        <li className="px-6 pl-8 text-sm py-1 pt-2">
          Start a
          <button
            type="button"
            onClick={() => {
              dispatch(
                showModal({
                  modalType: CREATE_SPACE_MODAL,
                })
              );
            }}
            className="ml-1 underline text-violet-500 decoration-dashed outline-violet-500 underline-offset-4"
          >
            new space
          </button>
        </li>
      )}
    </ul>
  );
};

export default SpaceList;
