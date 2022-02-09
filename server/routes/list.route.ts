import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as listController from "../controllers/list.controller";

const listRouter = express.Router();

// POST /lists -> create a new list
listRouter.post("/", authMiddleware, listController.createList);

export default listRouter;
