import { useDispatch } from "react-redux";
import spaces from "../../../data/spaces";
import { showModal } from "../../../redux/features/modalSlice";
import { SpaceObj } from "../../../types";
import { CREATE_SPACE_MODAL } from "../../../types/constants";
import SpaceItem from "./SpaceItem";

const SpaceList = () => {
  const dispatch = useDispatch();

  return (
    <ul className="space-list pb-2">
      {spaces.length > 0 ? (
        spaces.map((space: SpaceObj) => {
          return <SpaceItem key={space._id} space={space} />;
        })
      ) : (
        <li className="px-6 pl-8 text-sm py-1">
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
