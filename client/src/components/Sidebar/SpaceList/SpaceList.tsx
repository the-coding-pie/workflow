import { HiOutlineRefresh } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../../axiosInstance";
import spaces from "../../../data/spaces";
import { showModal } from "../../../redux/features/modalSlice";
import { SpaceObj } from "../../../types";
import { CREATE_SPACE_MODAL } from "../../../types/constants";
import Loader from "../../Loader/Loader";
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
        <Loader />
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
