import { HiOutlineLogout } from "react-icons/hi";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import person from "../../assets/img/person.png";
import { Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import Profile from "../../assets/img/default.jpg";
import useClose from "../../hooks/useClose";
import { logoutUser } from "../../redux/features/authSlice";
import Avatar from "react-avatar";
import { useQueryClient } from "react-query";
import { UserObj } from "../../types";
import { chopChars } from "../../utils/helpers";

interface Props {
  user: UserObj | null;
}

const ProfileCard = ({ user }: Props) => {
  const [show, setShow] = useState(false);
  const ref = useClose(() => setShow(false));

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const handleLogout = () => {
    // remove all query caches
    queryClient.removeQueries();

    dispatch(logoutUser());
  };

  return (
    <div className="relative profile-card" ref={ref}>
      {user ? (
        <Avatar
          onClick={() => setShow(!show)}
          src={user.profile}
          alt={`${user.username} profile`}
          size="32"
          round={true}
          className="cursor-pointer"
        />
      ) : (
        <Avatar
          onClick={() => setShow(!show)}
          src={undefined}
          alt={"no profile"}
          size="32"
          round={true}
          className="cursor-pointer"
        />
      )}

      {show && (
        <div
          className="absolute right-0 z-30 flex flex-col bg-white rounded-md shadow-lg extra-options arrow top-12"
          style={{
            minWidth: "160px",
          }}
        >
          <div className="user-details flex items-center p-3 border-b">
            <div className="left mr-3">
              {user ? (
                <Avatar
                  onClick={() => setShow(!show)}
                  src={user.profile}
                  alt={`${user.username} profile`}
                  size="32"
                  round={true}
                  className="cursor-pointer"
                />
              ) : (
                <Avatar
                  onClick={() => setShow(!show)}
                  src={undefined}
                  alt={"no profile"}
                  size="32"
                  round={true}
                  className="cursor-pointer"
                />
              )}
            </div>
            <div className="right text-sm">
              <h3 className="font-semibold mb-0.5">
                {user ? chopChars(24, user.username) : "Unknown"}
              </h3>
              <span className="email text-gray-600">{user ? chopChars(24, user.email) : "unknown"}</span>
            </div>
          </div>
          <Link
            to="/profile"
            onClick={() => {
              setShow(false);
            }}
            className="flex items-center justify-between w-full p-3 text-gray-600 hover:bg-gray-200  "
          >
            <span className="text-sm">Profile</span>
            <div className="text-gray-500">
              <CgProfile size={21} />
            </div>
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setShow(false);
            }}
            className="flex items-center justify-between w-full p-3 text-gray-600 rounded-md rounded-t-none hover:bg-gray-200 "
          >
            <span className="text-sm">Log Out</span>
            <div className="text-gray-500">
              <HiOutlineLogout size={21} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
