import express from "express";
import authRouter from "./auth.route";
import emailRouter from "./email.route";
import userRouter from "./user.route";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/email", emailRouter);

export default rootRouter;
