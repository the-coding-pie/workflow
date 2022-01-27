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
// Protected(Auth) DELETE /users -> deletes the current user
userRouter.delete("/", authMiddleware, userController.deleteCurrentUser);
// Protected(Auth) GET /users/search?q=query&spaceId=id -> search other user
userRouter.get("/search", authMiddleware, userController.searchUser);

export default userRouter;
