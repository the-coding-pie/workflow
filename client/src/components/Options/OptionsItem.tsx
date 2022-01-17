import React from "react";
import { IconType } from "react-icons";

interface Props {
  Icon: IconType;
  text: string;
  onClick: Function;
  iconColor?: string;
  iconFillColor?: string;
  textColor?: string;
}

const OptionsItem = ({
  Icon,
  text,
  onClick,
  iconColor,
  iconFillColor,
  textColor,
}: Props) => {
  return (
    <li
      onClick={() => onClick()}
      className="p-2 hover:bg-slate-100 first:rounded-t last:rounded-b flex items-center cursor-pointer"
    >
      <div className={`icon mr-2.5 flex items-center`}>
        <Icon
          color={iconColor ? iconColor : "currentColor"}
          fill={iconFillColor ? iconFillColor : "none"}
          size={16}
        />
      </div>
      <div
        style={{
          color: textColor ? textColor : "inherit",
        }}
      >
        {text}
      </div>
    </li>
  );
};

export default OptionsItem;
