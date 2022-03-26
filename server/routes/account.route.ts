import express from "express";
import * as accountController from "../controllers/account.controller";
import { authMiddleware } from "../middlewares/auth";
import { multerUploadSingle } from "../middlewares/multerUploadSingle";

const accountRouter = express.Router();

accountRouter.put(
  "/",
  authMiddleware,
  function (req, res, next) {
    multerUploadSingle(req, res, next, "profile");
  },
  accountController.updateAccount
);

accountRouter.post("/forgot-password", accountController.forgotPassword);
accountRouter.post("/reset-password/:token", accountController.resetPassword);

export default accountRouter;
