import mongoose from "mongoose";

// GET /favorites

import { Response } from "express";
import Space from "../models/space.model";
import Favorite from "../models/favorite.model";
import { SPACE } from "../types/constants";

// POST /favorites
export const addSpaceToFavorite = async (req: any, res: Response) => {
  try {
    const { spaceId, boardId } = req.body;

    if (!spaceId && !boardId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "spaceId or boardId is required",
        statusCode: 400,
      });
    }

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
    // if you are a space member
    // if you are a space admin -> then ok
    // if you are a space normal -> only public board
    // if you are a space guest -> this won't happen (because you must have came in the first board member check, if you are guest user)
    
  } catch {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};
