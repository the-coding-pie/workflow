import express from "express";
import * as accountController from "../controllers/account.controller";

const accountRouter = express.Router();

accountRouter.post("/forgot-password", accountController.forgotPassword);
accountRouter.post("/reset-password", accountController.resetPassword);

export default accountRouter;
