import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as boardController from "../controllers/board.controller";

const boardRouter = express.Router();

// Protected(Auth) POST /boards -> create new board
boardRouter.post("/", authMiddleware, boardController.createBoard);
// Protected(Auth) GET /boards/:id -> get board info
boardRouter.get("/:id", authMiddleware, boardController.getBoard);
// Protected(Auth) PUT /boards/:id/members/bulk -> add one or more members to board
boardRouter.put(
  "/:id/members/bulk",
  authMiddleware,
  boardController.addBoardMembers
);
// Protected(Auth) PUT /boards/:id/members/join -> join as board member
boardRouter.put("/:id/members/join", authMiddleware, boardController.joinBoard);
// Protected(Auth) PUT /boards/:id/members/:memberId -> update board member role
boardRouter.put(
  "/:id/members/:memberId",
  authMiddleware,
  boardController.updateMemberRole
);
// Protected(Auth) DELETE /boards/:id/members/:memberId -> remove board member
boardRouter.delete(
  "/:id/members/:memberId",
  authMiddleware,
  boardController.removeMember
);
// Protected(Auth) DELETE /boards/:id/members -> remove board member
boardRouter.delete(
  "/:id/members",
  authMiddleware,
  boardController.leaveFromBoard
);

export default boardRouter;
