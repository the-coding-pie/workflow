import jwt from "jsonwebtoken";
import { UserTokenObj } from "../types";

// 5 mins
export const generateAccessToken = (payload: UserTokenObj) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "300000",
  });
};

// 7 days
export const generateRefreshToken = (payload: UserTokenObj) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};
