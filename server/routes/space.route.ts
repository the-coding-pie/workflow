import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as spaceController from "../controllers/space.controller";

const spaceRouter = express.Router();

// Protected(Auth) POST /spaces -> create new space
spaceRouter.post("/", authMiddleware, spaceController.createSpace);
// Protected(Auth) GET /spaces/mine -> gets all the spaces in which current user is either an admin/normal member
spaceRouter.get("/mine", authMiddleware, spaceController.getSpacesMine);

export default spaceRouter;
