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
// Protected(Auth) GET /users/search/board?q=query&boardId=id -> search other user (board related)
userRouter.get("/search/board", authMiddleware, userController.searchUserBoard);
// Protected(Auth) GET /users/board/id -> get all space & board members
userRouter.get("/board/:id", authMiddleware, userController.getAllMembers);

export default userRouter;
