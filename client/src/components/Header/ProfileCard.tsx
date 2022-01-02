import { HiOutlineLogout } from "react-icons/hi";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import person from "../../assets/img/person.png";
import { Link } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import Profile from "../../assets/img/default.jpg";
import useClose from "../../hooks/useClose";
import { logoutUser } from "../../redux/features/authSlice";

const ProfileCard = () => {
  const [show, setShow] = useState(false);
  const ref = useClose(() => setShow(false));

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="relative profile-card" ref={ref}>
      <img
        onClick={() => setShow(!show)}
        src={Profile}
        alt="profile"
        className="w-8 h-8 rounded-full cursor-pointer"
      />

      {show && (
        <div className="absolute right-0 z-30 flex flex-col w-40 bg-white rounded-md shadow-lg extra-options arrow top-12">
          <Link
            to="/profile"
            onClick={() => {
              setShow(false);
            }}
            className="flex items-center justify-between w-full p-3 text-gray-600 rounded-md rounded-b-none hover:bg-gray-200  "
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
