import React, { useState } from "react";
import { HiOutlineUser, HiOutlineX } from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { MemberObjM } from "../../types";

interface AllMembers {
  boardMembers: MemberObjM[];
  spaceMembers: MemberObjM[];
}

interface Props {
  members: MemberObjM[] | null;
  cardId: string;
  listId: string;
  boardId: string;
  spaceId: string;
}

const AddMemberBtn = ({ members, cardId, listId, boardId, spaceId }: Props) => {
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const [show, setShow] = useState(false);

  const ref = useClose(() => setShow(false));

  const getAllBoardMembers = async ({ queryKey }: any) => {
    const response = await axiosInstance.get(`/users/board/${queryKey[1]}`);

    const { data } = response.data;

    return data;
  };

  const { data, isLoading, isFetching, error } = useQuery<
    AllMembers | undefined,
    any,
    AllMembers,
    string[]
  >(["getAllBoardMembers", boardId], getAllBoardMembers);

  let component = null;

  if (error) {
    component = (
      <p className="mt-6 ml-4 text-center">
        An error has occurred: {error.message}
      </p>
    );
  } else if (isLoading) {
    component = <p className="mt-6 ml-4 text-center">Loading...</p>;
  } else {
    component = (
      <div className="all-members">
        <div className="board-members">
          <span>Board Members</span>

          <div className="flex flex-col">
            {data!.boardMembers.map((m) => (
              <div className="board-member">{m.username}</div>
            ))}
          </div>
        </div>

        <div className="space-members">
          <span>Space Members</span>

          <div className="flex flex-col">
            {data!.spaceMembers.map((m) => (
              <div className="space-member">{m.username}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="add-member-btn relative z-40">
      <button
        onClick={() => setShow((prevValue) => !prevValue)}
        className="card-detail-btn"
      >
        <HiOutlineUser size={16} className="mr-1" />
        Members
      </button>

      {show && (
        <div
          className="bg-white rounded shadow-lg absolute top-8 left-0"
          style={{
            width: "400px",
          }}
        >
          <header className="flex items-center justify-between p-3 border-b mb-2">
            <span className="font-semibold">Members</span>
            <button onClick={() => setShow(false)}>
              <HiOutlineX size={18} />
            </button>
          </header>

          {component && component}
        </div>
      )}
    </div>
  );
};

export default AddMemberBtn;
