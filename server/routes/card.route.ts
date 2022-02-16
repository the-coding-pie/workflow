import express from "express";
import * as cardController from "../controllers/card.controller";
import { authMiddleware } from "../middlewares/auth";

const cardRouter = express.Router();

// POST /cards -> create a new card
cardRouter.post("/", authMiddleware, cardController.createCard);
// Protected(Auth) GET /cards/:id -> get card
cardRouter.get("/:id", authMiddleware, cardController.getCard);
// Protected(Auth) PUT /cards/:id/dnd -> dnd card
cardRouter.put("/:id/dnd", authMiddleware, cardController.dndCard);

export default cardRouter;
