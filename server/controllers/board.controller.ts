import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import Board from "../models/board.model";
import Space from "../models/space.model";
import {
  BOARD_MEMBER_ROLES,
  BOARD_VISIBILITY,
  SPACE_MEMBER_ROLES,
} from "../types/constants";

// POST /boards -> create new board
export const createBoard = async (req: any, res: Response) => {
  try {
    const { spaceId, name, bgImg, color, visibility } = req.body;

    // spaceId validation
    if (!spaceId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "spaceId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(spaceId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid spaceId",
        statusCode: 400,
      });
    }

    if (!name) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Board name is required",
        statusCode: 400,
      });
    } else if (name.length > 512) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Board name should be less than or equal to 512 chars",
        statusCode: 400,
      });
    }

    // bgImg is not necessary, but if it is present, then make sure it is an url
    if (bgImg) {
      if (
        !validator.isURL(bgImg, {
          require_protocol: true,
        })
      ) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Invalid Image URL",
          statusCode: 400,
        });
      }
    }

    // color
    if (!color) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Color cannot be empty",
        statusCode: 400,
      });
    } else if (!color.startsWith("#", 0) || color.length !== 7) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid color hex",
        statusCode: 400,
      });
    }

    // if visibility is present (by default it falls to PUBLIC)
    if (visibility) {
      if (!Object.values(BOARD_VISIBILITY).includes(visibility)) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Board visibility should be either PRIVATE or PUBLIC",
          statusCode: 400,
        });
      }
    }

    // make sure spaceId is valid, and the current user is either a space admin/normal user
    const space = await Space.findOne({ _id: spaceId });

    // if there is no space, or if the current user is not a part of the space, simply return 404
    if (
      !space ||
      !space.members
        .map((m: any) => m.memberId.toString())
        .includes(req.user._id.toString())
    ) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Space not found!",
        statusCode: 404,
      });
    }

    // check whether the current user is space admin or atleast a normal user
    const spaceMember = space.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );

    // check if his role is a GUEST
    if (
      spaceMember.role !== SPACE_MEMBER_ROLES.ADMIN &&
      spaceMember.role !== SPACE_MEMBER_ROLES.NORMAL
    ) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have the rights to create a board on this space :(",
        statusCode: 403,
      });
    }

    // now it's clear that the current user is a board member and he is either an ADMIN/NORMAL user
    // create a new board
    const newBoard = await new Board({
      name: validator.escape(name),
      color: color,
      spaceId: spaceId,
      creator: req.user._id,
    });

    if (visibility) {
      newBoard.visibility = visibility;
    }

    if (bgImg) {
      newBoard.bgImg = bgImg;
    }

    // add current user as admin member to the board
    newBoard.members.push({
      memberId: req.user._id,
      role: BOARD_MEMBER_ROLES.ADMIN,
    });

    // add this newBoard to the parent space
    space.boards.push(newBoard._id);

    await newBoard.save();
    await space.save();

    res.status(201).send({
      success: true,
      data: {},
      message: "New board has been created!",
      statusCode: 201,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};
