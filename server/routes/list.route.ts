import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as listController from "../controllers/list.controller";

const listRouter = express.Router();

// Protected(Auth) POST /lists -> create a new list
listRouter.post("/", authMiddleware, listController.createList);
// Protected(Auth) PUT /lists/:id/name -> update list name
listRouter.put("/:id/name", authMiddleware, listController.updateListName);
// Protected(Auth) GET /lists?boardId="boardId" -> get all lists under this board
listRouter.get("/", authMiddleware, listController.getLists);

export default listRouter;
