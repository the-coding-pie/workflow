import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import Board from "../models/board.model";
import Space from "../models/space.model";
import Favorite from "../models/favorite.model";
import {
  BOARD,
  BOARD_MEMBER_ROLES,
  BOARD_VISIBILITY,
  SPACE_MEMBER_ROLES,
} from "../types/constants";
import {
  BASE_PATH_COMPLETE,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
} from "../config";
import path from "path";

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
    const space = await Space.findOne({
      _id: spaceId,
      members: {
        $elemMatch: {
          memberId: req.user._id,
        },
      },
    });

    // if there is no space, or if the current user is not a part of the space, simply return 404
    if (!space) {
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
      fallbackRole: BOARD_MEMBER_ROLES.ADMIN,
    });

    // add this newBoard to the parent space
    space.boards.push(newBoard._id);

    await newBoard.save();
    await space.save();

    res.status(201).send({
      success: true,
      data: {
        _id: newBoard._id,
        isMember: true,
        visibility: newBoard.visibility,
        isFavorite: newBoard.isFavorite,
        color: newBoard.color,
        bgImg: newBoard.bgImg,
        name: newBoard.name,
        role: BOARD_MEMBER_ROLES.ADMIN,
        spaceId: newBoard.spaceId,
      },
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

// GET /boards/:id -> get board info
export const getBoard = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "board _id is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid board _id",
        statusCode: 400,
      });
    }

    // check for the board
    const board = await Board.findOne({ _id: id })
      .select(
        "_id name visibility description bgImg color spaceId lists members"
      )
      .populate({
        path: "members",
        populate: {
          path: "memberId",
          select: "_id username profile",
        },
      })
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check favorite
    const favorite = await Favorite.findOne({
      resourceId: board._id,
      userId: req.user._id,
      type: BOARD,
    });

    // check first if the current user is a member in board, if yes -> then that's it
    if (
      board.members
        .map((m: any) => m.memberId._id.toString())
        .includes(req.user._id.toString())
    ) {
      return res.send({
        success: true,
        data: {
          _id: board._id,
          name: board.name,
          description: board.description,
          bgImg: board.bgImg,
          color: board.color,
          space: {
            _id: board.spaceId._id,
            name: board.spaceId.name,
          },
          lists: board.lists,
          members: board.members.map((m: any) => {
            return {
              _id: m.memberId._id,
              username: m.memberId.username,
              profile: m.memberId.profile.includes("http")
                ? m.memberId.profile
                : BASE_PATH_COMPLETE +
                  path.join(
                    STATIC_PATH,
                    PROFILE_PICS_DIR_NAME,
                    m.memberId.profile
                  ),
              role: m.role,
              isSpaceAdmin:
                board.spaceId.members.find(
                  (sm: any) =>
                    sm.memberId.toString() === m.memberId._id.toString()
                ) &&
                board.spaceId.members.find(
                  (sm: any) =>
                    sm.memberId.toString() === m.memberId._id.toString()
                ).role === SPACE_MEMBER_ROLES.ADMIN
                  ? true
                  : false,
            };
          }),
          role: board.members.find(
            (m: any) => m.memberId._id.toString() === req.user._id.toString()
          ).role,
          visibility: board.visibility,
          isFavorite: favorite ? true : false,
          favoriteId: favorite && favorite._id,
        },
        message: "",
        statusCode: 200,
      });
    }

    // you are not a board member now
    // check if he is a part of the space
    if (
      !board.spaceId.members
        .map((m: any) => m.memberId.toString())
        .includes(req.user._id.toString())
    ) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // he is a member of the board, so now find his role
    // only ADMIN/NORMAL user will be able to see board
    // space ADMIN can see any board
    // NORMAL user can see PUBLIC boards (and PRIVATE boards if he is a member of it, but here it won't happen, because we already checked whether he is a member in the board or not above)
    const role = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    ).role;

    if (
      (role !== SPACE_MEMBER_ROLES.ADMIN &&
        role !== SPACE_MEMBER_ROLES.NORMAL) ||
      (role === SPACE_MEMBER_ROLES.NORMAL &&
        board.visibility === BOARD_VISIBILITY.PRIVATE)
    ) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // if you managed to came this far, you can see this board
    res.send({
      success: true,
      data: {
        _id: board._id,
        name: board.name,
        description: board.description,
        bgImg: board.bgImg,
        color: board.color,
        space: {
          _id: board.spaceId._id,
          name: board.spaceId.name,
        },
        lists: board.lists,
        members: board.members.map((m: any) => {
          return {
            _id: m.memberId._id,
            username: m.memberId.username,
            profile: m.memberId.profile.includes("http")
              ? m.memberId.profile
              : BASE_PATH_COMPLETE +
                path.join(
                  STATIC_PATH,
                  PROFILE_PICS_DIR_NAME,
                  m.memberId.profile
                ),
            role: m.role,
            isSpaceAdmin:
              board.spaceId.members.find(
                (sm: any) =>
                  sm.memberId.toString() === m.memberId._id.toString()
              ) &&
              board.spaceId.members.find(
                (sm: any) =>
                  sm.memberId.toString() === m.memberId._id.toString()
              ).role === SPACE_MEMBER_ROLES.ADMIN
                ? true
                : false,
          };
        }),
        role: role,
        visibility: board.visibility,
        isFavorite: favorite ? true : false,
        favoriteId: favorite && favorite._id,
      },
      message: "",
      statusCode: 200,
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
