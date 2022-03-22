import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as listController from "../controllers/list.controller";

const listRouter = express.Router();

// Protected(Auth) POST /lists -> create a new list
listRouter.post("/", authMiddleware, listController.createList);
// Protected(Auth) PUT /lists/:id/name -> update list name
listRouter.put("/:id/name", authMiddleware, listController.updateListName);
// Protected(Auth) PUT /lists/:id/dnd -> dnd list
listRouter.put("/:id/dnd", authMiddleware, listController.dndList);
// Protected(Auth) GET /lists?boardId="boardId" -> get all lists under this board
listRouter.get("/", authMiddleware, listController.getLists);
// Protected(Auth) DELETE /lists/:id -> delete list and cards below it
listRouter.delete("/:id", authMiddleware, listController.deleteList);

export default listRouter;
