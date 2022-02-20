import express from "express";
import * as cardController from "../controllers/card.controller";
import { authMiddleware } from "../middlewares/auth";

const cardRouter = express.Router();

// POST /cards -> create a new card
cardRouter.post("/", authMiddleware, cardController.createCard);
// Protected(Auth) GET /cards/:id -> get card
cardRouter.get("/:id", authMiddleware, cardController.getCard);
// Protected(Auth) DELETE /cards/:id -> delete card
cardRouter.delete("/:id", authMiddleware, cardController.deleteCard);
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
// Protected(Auth) PUT /cards/:id/members -> add card member
cardRouter.put("/:id/members", authMiddleware, cardController.addAMember);
// Protected(Auth) DELETE /cards/:id/members -> remove from card
cardRouter.delete(
  "/:id/members",
  authMiddleware,
  cardController.removeCardMember
);

// Protected(Auth) POST /cards/:id/comments -> add comment
cardRouter.post("/:id/comments", authMiddleware, cardController.createComment);
// Protected(Auth) PUT /cards/:id/comments -> update comment
cardRouter.put("/:id/comments", authMiddleware, cardController.updateComment);
// Protected(Auth) DELETE /cards/:id/comments -> delete comment
cardRouter.delete(
  "/:id/comments",
  authMiddleware,
  cardController.deleteComment
);

// Protected(Auth) GET /cards/:id/labels -> get labels
cardRouter.get("/:id/labels", authMiddleware, cardController.getCardLabels);
// Protected(Auth) PUT /cards/:id/labels -> add a label to card
cardRouter.put("/:id/labels", authMiddleware, cardController.addCardLabel);
// Protected(Auth) DELETE /cards/:id/labels -> remove label from card
cardRouter.delete(
  "/:id/labels",
  authMiddleware,
  cardController.removeCardLabel
);
// Protected(Auth) POST /cards/:id/labels -> create new label card
cardRouter.post("/:id/labels", authMiddleware, cardController.createLabel);

export default cardRouter;
