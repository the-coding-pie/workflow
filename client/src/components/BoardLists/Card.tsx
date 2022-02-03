import React from "react";
import { BOARD_ROLES } from "../../types/constants";

interface Props {
  myRole:
    | typeof BOARD_ROLES.ADMIN
    | typeof BOARD_ROLES.NORMAL
    | typeof BOARD_ROLES.OBSERVER;
}

const Card = ({ myRole }: Props) => {
  return (
    <li className="bg-white mb-2 rounded p-2 shadow hover:bg-slate-100 cursor-pointer font-normal text-gray-900">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Est vero facilis
      beatae, vel laboriosam accusantium quo natus voluptas distinctio illum!
      Rerum, tempore odio error ad laborum nulla aut sed voluptatibus.
    </li>
  );
};

export default Card;
