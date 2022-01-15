import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as spaceController from "../controllers/space.controller";

const spaceRouter = express.Router();

// Protected(Auth) POST /spaces -> create new space
spaceRouter.post("/", authMiddleware, spaceController.createSpace);

export default spaceRouter;
