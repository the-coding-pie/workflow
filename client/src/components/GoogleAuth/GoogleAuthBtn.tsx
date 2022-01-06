import React from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleAuthBtn = () => {
  return (
    <button className="flex items-center font-medium text-white bg-blue-500 shadow rounded p-2 mb-2">
      <div className="icon mr-4 bg-white p-0.5">
        <FcGoogle size={26} />
      </div>
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleAuthBtn;
