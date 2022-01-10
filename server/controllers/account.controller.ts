import { Request, Response } from "express";
import validator from "validator";
import User from "../models/user.model";
import ForgotPassword from "../models/forgotPassword.model";
import { createRandomToken } from "../utils/helpers";
import { CLIENT_URL, FORGOT_PASSWORD_TOKEN_LENGTH } from "../config";
import nodemailer from "nodemailer";

// POST /accounts/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      // if no email exists
      return res.status(400).send({
        success: false,
        data: {},
        message: "Email is required",
        statusCode: 400,
      });
    } else if (!validator.isEmail(email)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid email",
        statusCode: 400,
      });
    }

    const user = await User.findOne({ email: email }).select("_id email");

    if (user) {
      // delete old record if any exists
      await ForgotPassword.deleteOne({ userId: user._id });

      // send an email with token with a validity of 3 days
      const forgotPassword = await new ForgotPassword({
        userId: user._id,
        token: createRandomToken(FORGOT_PASSWORD_TOKEN_LENGTH),
      });

      console.log(forgotPassword.token)

      const genForgotPassword = await forgotPassword.save();

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
        subject: "Forgot Your Password?",
        html: `
        <h1>Forgot your password? It happens to the best of us.</h1>
        <p style="font-size: 16px; font-weight: 600;">To reset your password, click the link below. The link will self-destruct after three days.</p>
        
        <a style="font-size: 14px;" href=${CLIENT_URL}/reset-password/${genForgotPassword.token} target="_blank">Click here to reset your password</a>

        <br />
        <br />

        <p style="font-size: 14px;">If you do not want to change your password or didn't request a reset, you can ignore and delete this email.</p>
      `,
      };

      // fail silently if error happens
      transporter.sendMail(mailOptions, function (err, info) {
        transporter.close();
      });
    }

    res.send({
      success: true,
      data: {},
      message:
        "If an account exists for the email address, you will get an email with instructions on resetting your password. If it doesn't arrive, be sure to check your spam folder.",
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
