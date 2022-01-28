import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as boardController from "../controllers/board.controller";

const boardRouter = express.Router();

// Protected(Auth) POST /boards -> create new board
boardRouter.post("/", authMiddleware, boardController.createBoard);
// Protected(Auth) GET /boards/:id -> get board info
boardRouter.get("/:id", authMiddleware, boardController.getBoard);

export default boardRouter;
