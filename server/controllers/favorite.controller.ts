import mongoose from "mongoose";
import { Response } from "express";
import Space from "../models/space.model";
import Board from "../models/board.model";
import Favorite from "../models/favorite.model";
import {
  SPACE,
  BOARD,
  SPACE_MEMBER_ROLES,
  BOARD_VISIBILITY,
} from "../types/constants";

// GET /favorites
export const getMyFavorites = async (req: any, res: Response) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id });

    // filter out the favorites which currently doesn't applies to me
    const favoriteSpaces = favorites.filter((f: any) => f.type === SPACE);
    const favoriteBoards = favorites.filter((f: any) => f.type === BOARD);

    // check if i am a member of this space currently
    favoriteSpaces.map((fs: any) => {
      await Space.findOne({ _id: fs.resourceId })
    })
    res.send({
      success: true,
      data: {},
      message: "",
      statusCode: 200,
    });
  } catch {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};

// POST /favorites
export const addToFavorite = async (req: any, res: Response) => {
  try {
    const { spaceId, boardId } = req.body;

    // if both spaceId and boardId are absent
    if (!spaceId && !boardId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "spaceId or boardId is required",
        statusCode: 400,
      });
    }

    // if both are present
    if (spaceId && boardId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Provide either spaceId or boardId not both.",
        statusCode: 400,
      });
    }

    // now we will either have spaceId or a boardId
    // determine if it is a space or board
    const isSpace = Object.keys(req.body).includes("spaceId") ? true : false;

    if (isSpace) {
      // validate
      if (!mongoose.isValidObjectId(spaceId)) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Invalid spaceId",
          statusCode: 400,
        });
      }

      // check if such a space exists or not, and check if current user is an admin/normal/guest
      const space = await Space.findOne({
        _id: spaceId,
        members: {
          $elemMatch: {
            memberId: req.user._id,
          },
        },
      });

      if (!space) {
        return res.status(404).send({
          success: false,
          data: {},
          message: "Space not found!",
          statusCode: 404,
        });
      }

      // such a space exists and current user is currently member
      // check if current user already added this space to favorite
      const alreadySpaceFav = await Favorite.findOne({
        resourceId: spaceId,
        type: SPACE,
        userId: req.user._id,
      });

      if (alreadySpaceFav) {
        return res.send({
          success: true,
          data: {},
          message: "Space already added to favorite",
          statusCode: 200,
        });
      }

      // add this space to favorite
      const newFav = new Favorite({
        resourceId: space._id,
        userId: req.user._id,
        type: SPACE,
      });

      await newFav.save();

      return res.status(201).send({
        success: true,
        data: {},
        message: "Space added to favorite",
        statusCode: 201,
      });
    }

    // if it is not space, then definetely board
    // validate
    if (!mongoose.isValidObjectId(boardId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid boardId",
        statusCode: 400,
      });
    }

    // in order to like a board, that board should be visible to you
    // if you are a board member (any role) -> then ok
    // else
    // if you are a space member
    // if you are a space admin -> then ok
    // if you are a space normal -> only public board
    // if you are a space guest -> this won't happen (because you are already not a member of this board)
    const board = await Board.findOne({ _id: boardId })
      .select("_id members visibility spaceId")
      .populate({
        path: "spaceId",
        select: "_id members",
      });

    // if there is no board with that id, or if you are not a board member and you are not a admin in space and not a normal user, or if you are a normal user, and this board is private

    // if there is no board with that id
    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // if you are not a board member
    if (
      !board.members
        .map((m: any) => m.memberId.toString())
        .includes(req.user._id.toString())
    ) {
      // check whether if you are a space member, if so make sure you are an ADMIN or NORMAL user, if NORMAL user then make sure this board is PUBLIC
      // if you are not an ADMIN and a NORMAL user in this space
      if (
        !board.spaceId.members.find(
          (m: any) =>
            m.memberId.toString() === req.user._id.toString() &&
            m.role === SPACE_MEMBER_ROLES.ADMIN
        ) &&
        !board.spaceId.members.find(
          (m: any) =>
            m.memberId.toString() === req.user._id.toString() &&
            m.role === SPACE_MEMBER_ROLES.NORMAL
        )
      ) {
        return res.status(404).send({
          success: false,
          data: {},
          message: "Board not found!",
          statusCode: 404,
        });
      }

      // if you reached here, that means you are either an ADMIN or a NORMAL user
      // if you are a NORMAL user and this board is PRIVATE, and you are not a member of this board -> it's not possible
      if (
        board.spaceId.members.find(
          (m: any) =>
            m.memberId.toString() === req.user._id.toString() &&
            m.role === SPACE_MEMBER_ROLES.NORMAL
        ) &&
        board.visibility === BOARD_VISIBILITY.PRIVATE
      ) {
        return res.status(404).send({
          success: false,
          data: {},
          message: "Board not found!",
          statusCode: 404,
        });
      }
    }

    // such a board exists and current user can see this board
    // check if current user already added this board to favorite
    const alreadyBoardFav = await Favorite.findOne({
      resourceId: boardId,
      type: BOARD,
      userId: req.user._id,
    });

    if (alreadyBoardFav) {
      return res.send({
        success: true,
        data: {},
        message: "Board already added to favorite",
        statusCode: 200,
      });
    }

    // add this board to favorite
    const newFav = new Favorite({
      resourceId: board._id,
      userId: req.user._id,
      type: BOARD,
    });

    await newFav.save();

    return res.status(201).send({
      success: true,
      data: {},
      message: "Board added to favorite",
      statusCode: 201,
    });
  } catch {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};

// DELETE /favorites/:id
export const removeFavorite = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "favorite _id is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid favorite _id",
        statusCode: 400,
      });
    }

    const favorite = await Favorite.findOne({ _id: id, userId: req.user._id });

    if (!favorite) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "No such favorite exists",
        statusCode: 404,
      });
    }

    await Favorite.deleteOne({
      _id: id,
      userId: req.user._id,
    });

    res.send({
      success: true,
      data: {},
      message: "Removed from favorites",
      statusCode: 200,
    });
  } catch {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};
