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
// Protected(Auth) PUT /cards/:id/name -> update card name
cardRouter.put("/:id/name", authMiddleware, cardController.updateCardName);
// Protected(Auth) PUT /cards/:id/description -> update card description
cardRouter.put(
  "/:id/description",
  authMiddleware,
  cardController.updateCardDescription
);

// Protected(Auth) POST /cards/:id/comments -> add comment
cardRouter.post("/:id/comments", authMiddleware, cardController.createComment);

export default cardRouter;
