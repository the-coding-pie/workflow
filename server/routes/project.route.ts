import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as projectController from "../controllers/project.controller";

const projectRouter = express.Router();

// Protected(Auth) POST /projects -> create new project
projectRouter.post("/", authMiddleware, projectController.createProject);

export default projectRouter;
