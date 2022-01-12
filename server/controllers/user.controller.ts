import { Response } from "express";
import {
  BASE_PATH_COMPLETE,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
} from "../config";
import path from "path";
import EmailVerification from "../models/emailVerification.model.";
import ForgotPassword from "../models/forgotPassword.model";
import RefreshToken from "../models/refreshTokens.model";
import User from "../models/user.model";

// DELETE /users
export const deleteCurrentUser = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { password } = req.body;

    if (user.emailVerified === false) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "Verify your email first.",
        statusCode: 403,
      });
    }

    if (user.isOAuth === false) {
      if (!password) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Password is required",
          statusCode: 400,
        });
      }

      const userExists = await User.findOne({ _id: user._id }).select("password")

      if (!(await userExists.comparePassword(password))) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Invalid password",
          statusCode: 400,
        });
      }
    }

    await EmailVerification.deleteOne({ userId: user._id });
    await ForgotPassword.deleteOne({ userId: user._id });
    await RefreshToken.deleteOne({ userId: user._id });

    await user.remove();

    res.send({
      success: true,
      data: {},
      message: "Your account has been deleted successfully!",
      statusCode: 200,
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};

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
        profile: user.profile.includes("http")
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
