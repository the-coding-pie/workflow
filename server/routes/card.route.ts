import express from "express";
import * as cardController from "../controllers/card.controller";
import { authMiddleware } from "../middlewares/auth";

const cardRouter = express.Router();

// POST /cards -> create a new card
cardRouter.post("/", authMiddleware, cardController.createCard);

export default cardRouter;
