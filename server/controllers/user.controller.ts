import { Response } from "express";
import {
  BASE_PATH_COMPLETE,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
} from "../config";
import path from "path";
import EmailVerification from "../models/emailVerification.model.";
import ForgotPassword from "../models/forgotPassword.model";
import RefreshToken from "../models/refreshTokens.model";
import User from "../models/user.model";
import Space from "../models/space.model";
import mongoose from "mongoose";
import { BOARD_MEMBER_ROLES, SPACE_MEMBER_ROLES } from "../types/constants";
import Board from "../models/board.model";
import { BOARD_VISIBILITY } from "../types/constants";
import { getProfile } from "../utils/helpers";

// DELETE /users
export const deleteCurrentUser = async (req: any, res: Response) => {
  try {
    const user = req.user;
    const { password } = req.body;

    if (user.emailVerified === false) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "Verify your email first.",
        statusCode: 403,
      });
    }

    if (user.isOAuth === false) {
      if (!password) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Password is required",
          statusCode: 400,
        });
      }

      const userExists = await User.findOne({ _id: user._id }).select(
        "password"
      );

      if (!(await userExists.comparePassword(password))) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Invalid password",
          statusCode: 400,
        });
      }
    }

    await EmailVerification.deleteOne({ userId: user._id });
    await ForgotPassword.deleteOne({ userId: user._id });
    await RefreshToken.deleteOne({ userId: user._id });

    // remove all things related to this user -> PENDING

    await User.deleteOne({ _id: user._id });

    res.send({
      success: true,
      data: {},
      message: "Your account has been deleted successfully!",
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

// GET /users/getCurrentUser
export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.send({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        isOAuth: user.isOAuth,
        email: user.email,
        emailVerified: user.emailVerified,
        profile: user.profile.includes("http")
          ? user.profile
          : BASE_PATH_COMPLETE +
            path.join(STATIC_PATH, PROFILE_PICS_DIR_NAME, user.profile),
      },
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

// GET /users/search?q=query search users
export const searchUser = async (req: any, res: Response) => {
  try {
    const { q, spaceId } = req.query;

    if (!q) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Query string is required",
        statusCode: 400,
      });
    }

    // find other users except current searching user
    let otherUsers = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        },
        {
          _id: { $ne: req.user._id },
          emailVerified: true,
        },
      ],
    })
      .lean()
      .select("_id username profile");

    // if valid spaceId
    if (spaceId && mongoose.isValidObjectId(spaceId)) {
      // const space = await Space.findOne({
      //   _id: spaceId,
      //   members: {
      //     $elemMatch: {
      //       memberId: req.user._id,
      //       role: SPACE_MEMBER_ROLES.ADMIN,
      //     },
      //   },
      // })
      //   .select("_id members")
      //   .lean();

      // has security drawback, bcz if you are not a member of this space, still you will be able to see who are present in this space and who is not
      const space = await Space.findOne({
        _id: spaceId,
      })
        .select("_id members")
        .lean();

      if (space && space.members.length > 0) {
        otherUsers = otherUsers.map((u: any) => {
          if (
            space.members
              .map((m: any) => m.memberId.toString())
              .includes(u._id.toString())
          ) {
            return {
              ...u,
              isMember: true,
            };
          }

          return {
            ...u,
            isMember: false,
          };
        });
      }
    }

    res.send({
      success: true,
      data: otherUsers.map((user) => {
        return {
          ...user,
          profile: user.profile.includes("http")
            ? user.profile
            : BASE_PATH_COMPLETE +
              path.join(STATIC_PATH, PROFILE_PICS_DIR_NAME, user.profile),
        };
      }),
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

// GET /users/search/board?q=query search users
export const searchUserBoard = async (req: any, res: Response) => {
  try {
    const { q, boardId } = req.query;

    if (!q) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Query string is required",
        statusCode: 400,
      });
    }

    // find other users including current searching user
    let users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        },
        {
          emailVerified: true,
        },
      ],
    })
      .lean()
      .select("_id username profile");

    // if valid spaceId
    if (boardId && mongoose.isValidObjectId(boardId)) {
      // has security drawback, bcz if you are not a member of this board or space, still you will be able to see who are present in this space and who is not
      const board = await Board.findOne({
        _id: boardId,
      })
        .select("_id members")
        .lean();

      if (board && board.members.length > 0) {
        users = users.map((u: any) => {
          if (
            board.members
              .map((m: any) => m.memberId.toString())
              .includes(u._id.toString())
          ) {
            return {
              ...u,
              isMember: true,
            };
          }

          return {
            ...u,
            isMember: false,
          };
        });
      }
    }

    res.send({
      success: true,
      data: users.map((user) => {
        return {
          ...user,
          profile: user.profile.includes("http")
            ? user.profile
            : BASE_PATH_COMPLETE +
              path.join(STATIC_PATH, PROFILE_PICS_DIR_NAME, user.profile),
        };
      }),
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

// GET /users/board/:id -> get all members in board & space
export const getAllMembers = async (req: any, res: Response) => {
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

    const board = await Board.findOne({ _id: id })
      .select("spaceId members visibility")
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
        populate: {
          path: "members",
          populate: {
            path: "memberId",
            select: "_id username profile",
          },
        },
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

    // check whether the current user is board member or space member
    const boardMember = board.members.find(
      (m: any) => m.memberId._id.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId._id.toString() === req.user._id.toString()
    );

    if (
      (!boardMember && !spaceMember) ||
      (!boardMember &&
        spaceMember &&
        spaceMember.role === SPACE_MEMBER_ROLES.GUEST) ||
      (!boardMember &&
        spaceMember &&
        spaceMember.role === SPACE_MEMBER_ROLES.NORMAL &&
        board.visibility === BOARD_VISIBILITY.PRIVATE)
    ) {
      // you can't see this board at all
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found",
        statusCode: 404,
      });
    }

    // not safe
    // send the members info
    // both board members and space members
    const boardMembers = board.members;

    const boardMembersIds = boardMembers.map((m: any) =>
      m.memberId._id.toString()
    );

    const spaceMembers = board.spaceId.members
      .filter((m: any) => !boardMembersIds.includes(m.memberId._id.toString()))
      .filter((m: any) => m.role !== SPACE_MEMBER_ROLES.GUEST);

    res.send({
      success: true,
      data: {
        boardMembers: boardMembers.map((m: any) => {
          return {
            _id: m.memberId._id,
            username: m.memberId.username,
            profile: getProfile(m.memberId.profile),
          };
        }),
        spaceMembers: spaceMembers.map((m: any) => {
          return {
            _id: m.memberId._id,
            username: m.memberId.username,
            profile: getProfile(m.memberId.profile),
          };
        }),
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
