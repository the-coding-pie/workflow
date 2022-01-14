import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import { CLIENT_URL, EMAIL_TOKEN_LENGTH } from "../config";
import EmailVerification from "../models/emailVerification.model.";
import User from "../models/user.model";
import { createRandomToken } from "../utils/helpers";
import nodemailer from "nodemailer";

// email verify
export const emailVerify = async (req: any, res: Response) => {
  try {
    const { wuid } = req.query;
    const { token } = req.params;

    if (
      !wuid ||
      !isValidObjectId(wuid) ||
      !token ||
      token.length !== EMAIL_TOKEN_LENGTH
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
    const emailVer = await EmailVerification.findOne({
      userId: user._id,
      token: token,
      expiresAt: { $gt: new Date().toUTCString() },
    });

    if (!emailVer) {
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

    await EmailVerification.deleteOne({ _id: emailVer._id });

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

// resend verify email
export const resendVerifyEmail = async (req: any, res: Response) => {
  try {
    const user = req.user;

    // delete old record in emailVerification collection if any exists
    await EmailVerification.deleteOne({ userId: user._id });

    // create a new token and store it
    const emailVerification = new EmailVerification({
      userId: user._id,
      token: createRandomToken(EMAIL_TOKEN_LENGTH),
    });
    const genEmailVer = await emailVerification.save();

    // send email
    // create a transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL!,
        pass: process.env.GMAIL_PASSWORD!,
      },
    });

    // mail options
    const mailOptions = {
      from: `Workflow ${process.env.GMAIL}`,
      to: user.email,
      subject: "Verify Email",
      html: `
        <h1>Verify your email address</h1>
        <p style="font-size: 16px; font-weight: 600;">To start using workflow, just click the verify link below:</p>
        <p style="font-size: 14px; font-weight: 600; color: red;">And only click the link if you are the person who initiated this process.</p>
        <br />
        <a style="font-size: 14px;" href=${CLIENT_URL}/email/verify/${genEmailVer.token}?wuid=${genEmailVer.userId} target="_blank">Click here to verify your email</a>
      `,
    };

    // fail silently if error happens
    transporter.sendMail(mailOptions, function (err, info) {
      transporter.close();
    });

    return res.send({
      success: true,
      data: {},
      message: "Email resent!",
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
