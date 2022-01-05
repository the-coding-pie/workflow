import express from "express";
import * as userController from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth";

const userRouter = express.Router();

// Protected(Auth) GET /users/getCurrentUser -> gets the current user
userRouter.get(
  "/getCurrentUser",
  authMiddleware,
  userController.getCurrentUser
);

export default userRouter;
