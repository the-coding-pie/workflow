import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as spaceController from "../controllers/space.controller";

const spaceRouter = express.Router();

// Protected(Auth) GET /spaces -> get all spaces (sidebar)
spaceRouter.get("/", authMiddleware, spaceController.getSpaces);
// Protected(Auth) POST /spaces -> create new space
spaceRouter.post("/", authMiddleware, spaceController.createSpace);
// Protected(Auth) GET /spaces/mine -> gets all the spaces in which current user is either an admin/normal member
spaceRouter.get("/mine", authMiddleware, spaceController.getSpacesMine);
// Protected(Auth) GET /spaces/:id/info -> get space info
spaceRouter.get("/:id/info", authMiddleware, spaceController.getSpaceInfo);
// Protected(Auth) GET /spaces/:id/boards -> get all space boards according to user role
spaceRouter.get("/:id/boards", authMiddleware, spaceController.getAllBoards);
// Protected(Auth) GET /spaces/:id/members -> get all space members according to user role
spaceRouter.get(
  "/:id/members",
  authMiddleware,
  spaceController.getAllSpaceMembers
);
// Protected(Auth) POST /spaces/:id/members -> add a member to space
spaceRouter.post("/:id/members", authMiddleware, spaceController.addAMember);

export default spaceRouter;
