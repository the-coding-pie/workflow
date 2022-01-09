import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { CLIENT_URL, EMAIL_TOKEN_LENGTH } from "../config";
import EmailVerification from "../models/emailVerification.model.";
import User from "../models/user.model";

// email verify
export const emailVerify = async (req: Request, res: Response) => {
  try {
    const { wuid } = req.query;
    const { token } = req.params;

    if (!wuid) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "user id is required",
        statusCode: 400,
      });
    } else if (!isValidObjectId(wuid)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid user id",
        statusCode: 400,
      });
    }

    // token validation
    if (!token) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "token is required",
        statusCode: 400,
      });
    } else if (token.length < EMAIL_TOKEN_LENGTH) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid token",
        statusCode: 400,
      });
    }

    // check if user is valid
    const user = await User.findOne({ _id: wuid }).select("_id");

    if (!user) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "No user with that user id found!",
        statusCode: 404,
      });
    }

    // check for a record in emailVerification collection
    const validToken = await EmailVerification.findOne({
      userId: user._id,
      token: token,
      expiresAt: { $gt: new Date() },
    });

    if (!validToken) {
      return res.status(400).send({
        success: false,
        data: {},
        message:
          "Sorry, your email validation link has expired or is malformed",
        statusCode: 400,
      });
    }

    // got valid token -> update user info and delete the record, then redirect user to client
    user.emailVerified = true;
    await user.save();

    await validToken.remove();

    res.send({
      success: true,
      data: {},
      message: "Email verified!",
      statusCode: 200,
    });
  } catch {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong",
      statusCode: 500,
    });
  }
};
