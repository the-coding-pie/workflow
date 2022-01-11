import express from "express";
import * as emailController from "../controllers/email.controller";
import { authMiddleware } from "../middlewares/auth";

const emailRouter = express.Router();

emailRouter.get("/verify/:token", authMiddleware, emailController.emailVerify);
emailRouter.post(
  "/resend-verify",
  authMiddleware,
  emailController.resendVerifyEmail
);

export default emailRouter;
