import express from "express";
import * as authController from "../controllers/auth.controller";

const authRouter = express.Router();

// POST /auth/login -> login route
authRouter.post("/login", authController.loginUser);
// POST /auth/register -> register route
authRouter.post("/register", authController.registerUser);
// POST /auth/refresh -> get new accessToken
authRouter.post("/refresh", authController.refreshToken);

export default authRouter;