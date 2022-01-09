import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { CLIENT_URL, EMAIL_TOKEN_LENGTH } from "../config";
import EmailVerification from "../models/emailVerification.model.";
import User from "../models/user.model";

// email verify
export const emailVerify = async (req: any, res: Response) => {
  try {
    const { wuid } = req.query;
    const { token } = req.params;

    if (
      !wuid ||
      !isValidObjectId(wuid) ||
      !token ||
      token.length < EMAIL_TOKEN_LENGTH
    ) {
      return res.status(400).send({
        success: false,
        data: {},
        message:
          "Sorry, your email validation link has expired or is malformed",
        statusCode: 400,
      });
    }

    // check if user is valid
    const user = await User.findOne({ _id: wuid }).select(
      "_id email emailVerified"
    );

    if (!user) {
      return res.status(400).send({
        success: false,
        data: {},
        message:
          "Sorry, your email validation link has expired or is malformed",
        statusCode: 400,
      });
    }

    // when the req comes, make sure that the user.email (wuid user) === the requesting user's email
    if (user.email !== req.user.email) {
      return res.status(400).send({
        success: false,
        data: {},
        message:
          "Verification failed. The verification email you clicked on was for a different account.",
        statusCode: 400,
      });
    }

    // if wuid user's email is already verified
    if (user.emailVerified === true) {
      return res.send({
        success: true,
        data: {},
        message: "Email verified!",
        statusCode: 200,
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
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong",
      statusCode: 500,
    });
  }
};
