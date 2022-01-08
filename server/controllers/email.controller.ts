import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { EMAIL_TOKEN_LENGTH } from "../config";
import EmailVerification from "../models/emailVerification.model.";
import User from "../models/user.model";

// email verify
export const emailVerifiy = async (req: Request, res: Response) => {
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
      expiresAt: { $lte: new Date() },
    });

    console.log(validToken);
  } catch {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong",
      statusCode: 500,
    });
  }
};
