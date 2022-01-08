import express from "express";
import * as emailController from "../controllers/email.controller";

const emailRouter = express.Router();

emailRouter.get("/verify/:token", emailController.emailVerify);

export default emailRouter;
