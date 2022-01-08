import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import { UserTokenObj } from "../types";
import User from "../models/user.model";

export const authMiddleware = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const token = header && header?.split(" ")[1];

  if (!token) {
    return res.status(401).send({
      success: false,
      data: {},
      message: "Invalid token",
      statusCode: 401,
    });
  }

  // verify token, user -> {_id: 232}
  // jwt.verify() will throw an error if invalid token
  try {
    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as UserTokenObj;

    const user = await User.findById(payload._id).select("_id username profile email emailVerified isOAuth");

    // if no such user exists (bcz user has been deleted or invalid user _id)
    if (!user) {
      return res.status(401).send({
        success: false,
        data: {},
        message: "Invalid user",
        statusCode: 401,
      });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).send({
      success: false,
      data: {},
      message: "Invalid access token",
      statusCode: 401,
    });
  }
};
