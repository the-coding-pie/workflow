import { AxiosError } from "axios";
import React, { useCallback, useState } from "react";
import { HiOutlineLockClosed, HiOutlineStar } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import { addToast } from "../../redux/features/toastSlice";
import { BoardObj, SpaceObj } from "../../types";
import { BOARD_VISIBILITY_TYPES, ERROR } from "../../types/constants";
import UtilityBtn from "../UtilityBtn/UtilityBtn";

interface Props {
  board: BoardObj;
}

const RecentBoard = ({ board }: Props) => {
  const [isIn, setIsIn] = useState(false);

  return (
    <Link
      onMouseEnter={() => setIsIn(true)}
      onMouseLeave={() => setIsIn(false)}
      to={`/b/${board._id}`}
      className="board relative h-28 rounded cursor-pointer text-white font-semibold  hover:bg-gradient-to-r from-slate-500 to-slate-500 bg-blend-darken"
      style={{
        background: board.bgImg ? `url(${board.bgImg})` : board.color,
        backgroundRepeat: "no-repeat",
        boxShadow: `inset 0 0 0 2000px rgba(0, 0, 0, 0.22)`,
        backgroundPosition: "50%",
        backgroundOrigin: "border-box",
        backgroundSize: "cover",
        width: 230,
        maxWidth: 230,
        backgroundBlendMode: "overlay",
      }}
    >
      {isIn && (
        <div className="overlay absolute rounded top-0 right-0 bottom-0 left-0 bg-slate-900 opacity-20"></div>
      )}
      <div className="details absolute top-0 right-0 bottom-0 left-0 flex px-3 py-2">
        {board.name}
      </div>

      <div className="absolute bottom-2 left-2">
        {board.visibility === BOARD_VISIBILITY_TYPES.PRIVATE && (
          <UtilityBtn
            iconSize={14}
            uniqueId="private-board-component"
            Icon={HiOutlineLockClosed}
            label="Private Board"
            tooltipPosition="bottom"
          />
        )}
      </div>
    </Link>
  );
};

export default RecentBoard;
