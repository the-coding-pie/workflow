import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as projectController from "../controllers/project.controller";
import { multerUploadSingle } from "../middlewares/multerUploadSingle";

const projectRouter = express.Router();

// Protected(Auth) POST /projects -> create new project
projectRouter.post(
  "/",
  authMiddleware,
  function (req, res, next) {
    multerUploadSingle(req, res, next, "icon");
  },
  projectController.createProject
);

export default projectRouter;
