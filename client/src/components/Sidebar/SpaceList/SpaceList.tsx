import spaces from "../../../data/spaces";
import { SpaceObj } from "../../../types";
import SpaceItem from "./SpaceItem";

const SpaceList = () => {
  return (
    <ul className="space-list">
      {spaces.length > 0 ? (
        spaces.map((space: SpaceObj) => {
          return <SpaceItem key={space._id} space={space} />;
        })
      ) : (
        <li className="px-6 text-sm py-1">
          Start a
          <button className="ml-1 underline text-violet-500 decoration-dashed outline-violet-500 underline-offset-4">
            new space
          </button>
        </li>
      )}
    </ul>
  );
};

export default SpaceList;
