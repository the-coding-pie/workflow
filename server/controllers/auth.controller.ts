import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import validator from "validator";
import User from "../models/user.model";
import { generateAccessToken, generateRefreshToken } from "../utils/token";

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
      function (err: any, user: any) {
        if (err) {
          return res.status(401).send({
            success: false,
            data: {},
            message: "Invalid refresh token",
            statusCode: 401,
          });
        }

        // valid refresh token, so generate a new accessToken and send it
        const newAccessToken = generateAccessToken({
          _id: user._id,
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

    // check if user with same username/email already exists or not
    const userExists = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (userExists) {
      return res.status(409).send({
        success: false,
        data: {},
        message: "User with that username or email already exists",
        statusCode: 409,
      });
    }

    const user = await new User({
      username: username.trim(),
      email: email.trim(),
      password,
    });
    const genUser = await user.save();

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
  } catch {
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
    const refreshToken = generateRefreshToken({
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
