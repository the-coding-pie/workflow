import express from "express";
import * as emailController from "../controllers/email.controller";
import { authMiddleware } from "../middlewares/auth";

const emailRouter = express.Router();

// Protected(Auth) GET /email/verify/:token -> emailverify
emailRouter.get("/verify/:token", authMiddleware, emailController.emailVerify);
// Protected(Auth) POST /email/resend-verify -> resendVerifyEmail
emailRouter.post(
  "/resend-verify",
  authMiddleware,
  emailController.resendVerifyEmail
);

export default emailRouter;
