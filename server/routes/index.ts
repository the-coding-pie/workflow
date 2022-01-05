import express from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);

export default rootRouter;
