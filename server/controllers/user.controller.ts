import { Response } from "express";
import {
  BASE_PATH_COMPLETE,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
} from "../config";
import User from "../models/user.model";
import path from "path";

// GET /users/getCurrentUser
export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.send({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        profile: user.isOAuth
          ? user.profile
          : BASE_PATH_COMPLETE +
            path.join(STATIC_PATH, PROFILE_PICS_DIR_NAME, user.profile),
      },
      message: "",
      statusCode: 200,
    });
  } catch {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};
