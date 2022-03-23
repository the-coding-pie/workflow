import express from "express";
import { authMiddleware } from "../middlewares/auth";
import * as spaceController from "../controllers/space.controller";
import { multerUploadSingle } from "../middlewares/multerUploadSingle";

const spaceRouter = express.Router();

// Protected(Auth) GET /spaces -> get all spaces (sidebar)
spaceRouter.get("/", authMiddleware, spaceController.getSpaces);

// Protected(Auth) POST /spaces -> create new space
spaceRouter.post("/", authMiddleware, spaceController.createSpace);

// Protected(Auth) GET /spaces/mine -> gets all the spaces in which current user is either an admin/normal member (for board creation dropdown)
spaceRouter.get("/mine", authMiddleware, spaceController.getSpacesMine);

// Protected(Auth) GET /spaces/:id/info -> get space info
spaceRouter.get("/:id/info", authMiddleware, spaceController.getSpaceInfo);
// Protected(Auth) GET /spaces/:id/boards -> get all space boards according to user role
spaceRouter.get("/:id/boards", authMiddleware, spaceController.getSpaceBoards);
// Protected(Auth) GET /spaces/:id/members -> get all space members according to user role
spaceRouter.get(
  "/:id/members",
  authMiddleware,
  spaceController.getAllSpaceMembers
);
// Protected(Auth) PUT /spaces/:id/members -> add a member to space
spaceRouter.put("/:id/members", authMiddleware, spaceController.addAMember);
// Protected(Auth) PUT /spaces/:id/members/bulk -> add one or more members to space
spaceRouter.put(
  "/:id/members/bulk",
  authMiddleware,
  spaceController.addSpaceMembers
);
// Protected(Auth) PUT /spaces/:id/members/:memberId -> update member role in space
spaceRouter.put(
  "/:id/members/:memberId",
  authMiddleware,
  spaceController.updateMemberRole
);
// Protected(Auth) DELETE /spaces/:id/members/:memberId -> remove the member from this space and remove him from all his boards in this space
spaceRouter.delete(
  "/:id/members/:memberId",
  authMiddleware,
  spaceController.removeMember
);
// Protected(Auth) DELETE /spaces/:id/members -> leave from space
spaceRouter.delete(
  "/:id/members",
  authMiddleware,
  spaceController.leaveFromSpace
);

// Protected(Auth) GET /spaces/:id/settings -> get space settings
spaceRouter.get(
  "/:id/settings",
  authMiddleware,
  spaceController.getSpaceSettings
);
// Protected(Auth) PUT /spaces/:id/settings -> update space settings
spaceRouter.put(
  "/:id/settings",
  authMiddleware,
  function (req, res, next) {
    multerUploadSingle(req, res, next, "icon");
  },
  spaceController.updateSpaceSettings
);
// Protected(Auth) DELETE /spaces/:id -> delete space
spaceRouter.delete("/:id", authMiddleware, spaceController.deleteSpace);

export default spaceRouter;
