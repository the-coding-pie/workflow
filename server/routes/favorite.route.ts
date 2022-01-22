import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as favoriteController from "../controllers/favorite.controller";

const favoriteRouter = express.Router();

// Protected(Auth) GET /favorites -> get all my favorites (for sidebar)
favoriteRouter.get("/", authMiddleware, favoriteController.getMyFavorites);
// Protected(Auth) POST /favorites -> make a space or board favorite
favoriteRouter.post("/", authMiddleware, favoriteController.addToFavorite);
// Protected(Auth) DELETE /favorites/:id -> removes a space or board from favorite
favoriteRouter.delete(
  "/:id",
  authMiddleware,
  favoriteController.removeFavorite
);

export default favoriteRouter;
