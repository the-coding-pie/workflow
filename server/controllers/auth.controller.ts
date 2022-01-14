import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import validator from "validator";
import EmailVerification from "../models/emailVerification.model.";
import ForgotPassword from "../models/forgotPassword.model";
import User from "../models/user.model";
import { createRandomToken } from "../utils/helpers";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { generateUsername } from "../utils/uniqueUsernameGen";
import nodemailer from "nodemailer";
import { CLIENT_URL, EMAIL_TOKEN_LENGTH } from "../config";
import RefreshToken from "../models/refreshTokens.model";

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // if no refreshToken, or if it is invalid one
    if (!refreshToken) {
      return res.status(401).send({
        success: false,
        data: {},
        message: "refreshToken is required",
        statusCode: 401,
      });
    }

    // check validity of refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      async function (err: any, payload: any) {
        if (err) {
          return res.status(401).send({
            success: false,
            data: {},
            message: "Invalid refresh token, please login to continue",
            statusCode: 401,
          });
        }

        // check in db
        const isValidRefreshToken = await RefreshToken.findOne({
          userId: payload._id,
          refreshToken: refreshToken,
        });

        if (!isValidRefreshToken) {
          return res.status(401).send({
            success: false,
            data: {},
            message: "Invalid refresh token",
            statusCode: 401,
          });
        }

        // valid refresh token, so generate a new accessToken and send it
        const newAccessToken = generateAccessToken({
          _id: payload._id,
        });
        return res.send({
          success: true,
          data: {
            accessToken: newAccessToken,
          },
          message: "",
          statusCode: 200,
        });
      }
    );
  } catch {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // validation
    if (!username) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Username is required",
        statusCode: 400,
      });
    } else if (username.length < 2) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Username must be atleast 2 chars long",
        statusCode: 400,
      });
    } else if (!/^[A-Za-z0-9_-]*$/.test(username)) {
      return res.status(400).send({
        success: false,
        data: {},
        message:
          "Username must only contain letters, numbers, underscores and dashes",
        statusCode: 400,
      });
    }

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

    if (!password) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Password is required",
        statusCode: 400,
      });
    } else if (password.length < 8) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Password must be at least 8 chars long",
        statusCode: 400,
      });
    } else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      // check if password has atleast one digit and one letter
      return res.status(400).send({
        success: false,
        data: {},
        message: "Password must contain at least one letter and one number",
        statusCode: 400,
      });
    }

    // check if user with same email already exists or not
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      const emailVer = await EmailVerification.findOne({
        userId: userExists._id,
        expiresAt: { $gt: new Date().toUTCString() },
      });

      // records -> email not verified (both expired and not expired)
      // if email verified or link not expired
      if (userExists.emailVerified === true || emailVer) {
        return res.status(409).send({
          success: false,
          data: {},
          message: "This email is already taken. Please log in.",
          statusCode: 409,
        });
      }

      // remove the user, the emailVer record, and forgotPassword, and refreshToken
      // then create a new user
      await ForgotPassword.deleteOne({ userId: userExists._id });
      await EmailVerification.deleteOne({ userId: userExists._id });
      await RefreshToken.deleteOne({ userId: userExists._id });
      await User.deleteOne({ _id: userExists._id });
    }

    // create new user
    const user = new User({
      username: username.trim(),
      email: email.trim(),
      password,
    });

    const genUser = await user.save();

    // token generation for email verification
    // store it in database
    const emailVerification = new EmailVerification({
      userId: genUser._id,
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
      to: genUser.email,
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

    // generate accessToken & refreshToken
    const accessToken = await generateAccessToken({
      _id: genUser._id,
    });
    const refreshToken = await generateRefreshToken({
      _id: genUser._id,
    });

    return res.status(201).send({
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
      message: "Your account has been created successfully!",
      statusCode: 201,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      // if no email exists
      return res.status(400).send({
        success: false,
        data: {},
        message: "Email is required",
        statusCode: 400,
      });
    } else if (!validator.isEmail(email)) {
      // match - true, false
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid email",
        statusCode: 400,
      });
    }

    if (!password) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Password is required",
        statusCode: 400,
      });
    }

    // check if user exists or not
    const user = await User.findOne({ email });

    // if open authentication
    if (user && user.isOAuth) {
      return res.status(401).send({
        success: false,
        data: {},
        message: "This account can only be logged into with Google",
        statusCode: 401,
      });
    }

    // if no user / passwords doesn't match
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({
        success: false,
        data: {},
        message: "Invalid email or password",
        statusCode: 401,
      });
    }

    // generate tokens
    const accessToken = generateAccessToken({
      _id: user._id,
    });
    const refreshToken = await generateRefreshToken({
      _id: user._id,
    });

    return res.send({
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
      message: "",
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

// google OAuth
export const googleAuth = async (req: Request, res: Response) => {
  try {
    let ticket;
    const { tokenId } = req.body;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // validate tokenId
    try {
      ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Google OAuth failed",
        statusCode: 400,
      });
    }

    // valid token
    const payload = ticket.getPayload()!;

    // register or login
    // send tokens

    // if user doesn't exists with this email, create the user
    const userExists = await User.findOne({ email: payload.email }).select(
      "_id emailVerified"
    );

    let accessToken;
    let refreshToken;

    if (!userExists) {
      // create valid username
      const username = generateUsername();

      const user = new User({
        username: username!.trim(),
        email: payload.email!.trim(),
        profile: payload.picture!,
        emailVerified: true,
        isOAuth: true,
      });

      const genUser = await user.save();

      // generate tokens
      accessToken = await generateAccessToken({
        _id: genUser._id,
      });
      refreshToken = await generateRefreshToken({
        _id: genUser._id,
      });
    } else {
      // emailVerified false (manual registration)
      if (userExists.emailVerified === false) {
        // delete the old user
        // delete record in the emailVerification collection
        // create new user with isOAuth=true & emailVerified=true
        await RefreshToken.deleteOne({ userId: userExists._id });
        await ForgotPassword.deleteOne({ userId: userExists._id });
        await User.deleteOne({ _id: userExists._id });
        await EmailVerification.deleteOne({ userId: userExists._id });

        // create valid username
        const username = generateUsername();

        const newUser = new User({
          username: username!.trim(),
          email: payload.email!.trim(),
          profile: payload.picture!,
          emailVerified: true,
          isOAuth: true,
        });

        const genNewUser = await newUser.save();

        // generate tokens
        accessToken = await generateAccessToken({
          _id: genNewUser._id,
        });
        refreshToken = await generateRefreshToken({
          _id: genNewUser._id,
        });
      } else {
        // user already verified email, so allow Google OAuth
        // generate tokens
        accessToken = await generateAccessToken({
          _id: userExists._id,
        });
        refreshToken = await generateRefreshToken({
          _id: userExists._id,
        });
      }
    }

    return res.status(200).send({
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
      message: "Google OAuth successfull",
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
