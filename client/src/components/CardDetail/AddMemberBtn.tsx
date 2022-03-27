import { AxiosError } from "axios";
import React, { useState } from "react";
import {
  HiOutlineCheck,
  HiOutlineRefresh,
  HiOutlineUser,
  HiOutlineX,
} from "react-icons/hi";
import { useQuery, useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import axiosInstance from "../../axiosInstance";
import useClose from "../../hooks/useClose";
import { hideModal } from "../../redux/features/modalSlice";
import { addToast } from "../../redux/features/toastSlice";
import { MemberObjM } from "../../types";
import { ERROR } from "../../types/constants";
import Profile from "../Profile/Profile";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

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

  const addAMember = (memberId: string) => {
    axiosInstance
      .put(
        `/cards/${cardId}/members`,
        {
          memberId: memberId,
        },
        {
          headers: {
            ContentType: "application/json",
          },
        }
      )
      .then((response) => {
        const { data } = response.data;

        setShow(false);

        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            members: oldValue.members ? [...oldValue.members, data] : [data],
          };
        });

        // update in getLists query Cache
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              setShow(false);
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              setShow(false);
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);

              queryClient.invalidateQueries(["getRecentBoards"]);
              queryClient.invalidateQueries(["getAllMyCards"]);

              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
              queryClient.invalidateQueries(["getCard", cardId]);
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
  };

  const removeCardMember = (memberId: string) => {
    axiosInstance
      .delete(`/cards/${cardId}/members`, {
        data: {
          memberId: memberId,
        },
        headers: {
          ContentType: "application/json",
        },
      })
      .then((response) => {
        setShow(false);

        queryClient.invalidateQueries(["getAllMyCards"]);

        queryClient.setQueryData(["getCard", cardId], (oldValue: any) => {
          return {
            ...oldValue,
            members: oldValue.members.filter((m: any) => m._id !== memberId),
          };
        });

        // update in getLists query Cache
        queryClient.invalidateQueries(["getLists", boardId]);
      })
      .catch((error: AxiosError) => {
        if (error.response) {
          const response = error.response;
          const { message } = response.data;

          switch (response.status) {
            case 403:
              setShow(false);
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);

              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);
              break;
            case 404:
              setShow(false);
              dispatch(hideModal());
              dispatch(addToast({ kind: ERROR, msg: message }));

              queryClient.invalidateQueries(["getCard", cardId]);
              queryClient.invalidateQueries(["getBoard", boardId]);
              queryClient.invalidateQueries(["getLists", boardId]);
              queryClient.invalidateQueries(["getSpaces"]);
              queryClient.invalidateQueries(["getFavorites"]);

              queryClient.invalidateQueries(["getRecentBoards"]);
              queryClient.invalidateQueries(["getAllMyCards"]);

              queryClient.invalidateQueries(["getSpaceBoards", spaceId]);
              queryClient.invalidateQueries(["getSpaceSettings", spaceId]);
              queryClient.invalidateQueries(["getSpaceMembers", spaceId]);
              break;
            case 400:
              queryClient.invalidateQueries(["getCard", cardId]);
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
  };

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
      <p className="mt-6 ml-4 text-center flex items-center p-1">
        An error has occurred: {error.message}
        <UtilityBtn
          iconSize={16}
          Icon={HiOutlineRefresh}
          label="Retry"
          classes="ml-2"
          uniqueId="error-board-lists-retry"
          onClick={() => {
            queryClient.invalidateQueries(["getAllBoardMembers", boardId]);
          }}
        />
      </p>
    );
  } else if (isLoading) {
    component = <p className="mt-6 ml-4 text-center">Loading...</p>;
  } else {
    component = (
      <div className="all-members px-4">
        <div className="board-members mb-4">
          <span className="text-sm text-slate-600 mb-2 inline-block font-semibold">
            Board Members
          </span>

          <div className="flex flex-col">
            {data!.boardMembers.length > 0 ? (
              data!.boardMembers.map((m) => (
                <button
                  type="button"
                  key={m._id}
                  onClick={() => {
                    if (members?.map((cm) => cm._id).includes(m._id)) {
                      removeCardMember(m._id);
                    } else {
                      addAMember(m._id);
                    }
                  }}
                  className="board-member text-sm px-2 py-1.5 bg-slate-200 rounded hover:bg-primary_light cursor-pointer mb-2 font-medium flex items-center justify-between"
                >
                  <div className="left flex items-center">
                    <Profile src={m.profile} classes="mr-4" />
                    <span>{m.username}</span>
                  </div>
                  {members?.map((cm) => cm._id).includes(m._id) && (
                    <div className="right">
                      <HiOutlineCheck size={16} />
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="text-sm p-2">No users found</div>
            )}
          </div>
        </div>

        <div className="space-members">
          <span className="text-sm text-slate-600 mb-2 inline-block font-semibold">
            Space Members
          </span>

          <div className="flex flex-col">
            {data!.spaceMembers.length > 0 ? (
              data!.spaceMembers.map((m) => (
                <button
                  onClick={() => {
                    if (members?.map((cm) => cm._id).includes(m._id)) {
                      removeCardMember(m._id);
                    } else {
                      addAMember(m._id);
                    }
                  }}
                  type="button"
                  key={m._id}
                  className="space-member text-sm px-2 py-1.5 bg-slate-200 rounded hover:bg-primary_light cursor-pointer mb-2 font-medium flex items-center justify-between"
                >
                  <div className="left flex items-center">
                    <Profile src={m.profile} classes="mr-4" />
                    <span>{m.username}</span>
                  </div>
                  {members?.map((cm) => cm._id).includes(m._id) && (
                    <div className="right">
                      <HiOutlineCheck size={16} />
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="text-sm p-2">No users found</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="add-member-btn relative">
      <button
        onClick={() => setShow((prevValue) => !prevValue)}
        className="card-detail-btn"
      >
        <HiOutlineUser size={16} className="mr-1" />
        Members
      </button>

      {show && (
        <div
          className="bg-white rounded shadow-lg absolute top-8 left-0 z-40"
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
