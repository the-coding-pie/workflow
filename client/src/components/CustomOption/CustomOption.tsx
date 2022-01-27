import React from "react";
import Profile from "../Profile/Profile";

const CustomOption = (props: any) => {
  const { innerProps, innerRef, data, isDisabled } = props;

  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`hover:bg-violet-300 ${isDisabled ? 'cursor-default opacity-40' : 'cursor-pointer'} p-2 flex items-center`}
    >
      <div className="left mr-2">
        <Profile src={data.profile} alt={`${data.label} profile`} />
      </div>
      <div className="right">
        <h3 className="text-sm font-medium text-slate-800">{data.label}</h3>
      </div>
    </div>
  );
};

export default CustomOption;
