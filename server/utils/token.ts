import jwt from "jsonwebtoken";
import RefreshToken from "../models/refreshTokens.model";
import { UserTokenObj } from "../types";

// 5 mins
export const generateAccessToken = (payload: UserTokenObj) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "5m",
  });
};

// 7 days
export const generateRefreshToken = async (payload: UserTokenObj) => {
  // check if a valid refresh token exists in database, if so return that, else new one
  const tokenExists = await RefreshToken.findOne({ userId: payload._id });

  if (tokenExists) {
    try {
      await jwt.verify(
        tokenExists.refreshToken,
        process.env.REFRESH_TOKEN_SECRET!
      );

      return tokenExists.refreshToken;
    } catch (e) {
      // delete old token
      await RefreshToken.deleteOne({ _id: tokenExists._id });

      // generate new one
      const newToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
        expiresIn: "7d",
      });

      const refreshDoc = new RefreshToken({
        userId: payload._id,
        refreshToken: newToken,
      });
      await refreshDoc.save();
      return newToken;
    }
  } else {
    const newToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    const refreshDoc = new RefreshToken({
      userId: payload._id,
      refreshToken: newToken,
    });
    await refreshDoc.save();
    return newToken;
  }
};
