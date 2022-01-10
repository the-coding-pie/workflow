import express from "express";
import authRouter from "./auth.route";
import emailRouter from "./email.route";
import userRouter from "./user.route";
import accountRouter from "./account.route";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/email", emailRouter);
rootRouter.use("/accounts", accountRouter);

export default rootRouter;
