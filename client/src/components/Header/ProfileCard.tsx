import { HiOutlineLogout } from "react-icons/hi";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import useClose from "../../hooks/useClose";
import { logoutUser } from "../../redux/features/authSlice";
import { chopChars } from "../../utils/helpers";
import { RootState } from "../../redux/app";
import Profile from "../Profile/Profile";

const ProfileCard = () => {
  const [show, setShow] = useState(false);
  const ref = useClose(() => setShow(false));

  const { user } = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="relative profile-card noselect" ref={ref}>
      {user ? (
        <Profile
          onClick={() => setShow(!show)}
          src={user.profile}
          alt={`${user.username} profile`}
          classes="cursor-pointer"
        />
      ) : (
        <Profile
          onClick={() => setShow(!show)}
          src={undefined}
          classes="cursor-pointer"
        />
      )}

      {show && (
        <div
          className="absolute right-0 z-40 flex flex-col bg-white rounded-md shadow-lg extra-options arrow top-12"
          style={{
            minWidth: "160px",
          }}
        >
          <div className="user-details flex items-center p-3 border-b">
            <div className="left w-8 mr-3">
              {user ? (
                <Profile src={user.profile} alt={`${user.username} profile`} />
              ) : (
                <Profile src={undefined} />
              )}
            </div>
            <div className="right text-sm">
              <h3 className="font-semibold mb-0.5">
                {user ? chopChars(24, user.username) : "Unknown"}
              </h3>
              <span className="email text-gray-600">
                {user ? chopChars(24, user.email) : "unknown"}
              </span>
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
