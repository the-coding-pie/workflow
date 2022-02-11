import express from "express";
import authRouter from "./auth.route";
import emailRouter from "./email.route";
import userRouter from "./user.route";
import accountRouter from "./account.route";
import spaceRouter from "./space.route";
import boardRouter from "./board.route";
import favoriteRouter from "./favorite.route";
import listRouter from "./list.route";
import cardRouter from "./card.route";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/email", emailRouter);
rootRouter.use("/accounts", accountRouter);
rootRouter.use("/spaces", spaceRouter);
rootRouter.use("/boards", boardRouter);
rootRouter.use("/favorites", favoriteRouter);
rootRouter.use("/lists", listRouter);
rootRouter.use("/cards", cardRouter);

export default rootRouter;
