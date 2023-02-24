import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import Board from "../models/board.model";
import Space from "../models/space.model";
import Favorite from "../models/favorite.model";
import Label from "../models/label.model";
import {
  BOARD,
  BOARD_MEMBER_ROLES,
  BOARD_VISIBILITY,
  LABEL_COLORS,
  SPACE_MEMBER_ROLES,
} from "../types/constants";
import {
  BASE_PATH_COMPLETE,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
} from "../config";
import path from "path";
import { checkAllString, getPos, getUniqueValues } from "../utils/helpers";
import User from "../models/user.model";
import Card from "../models/card.model";
import List from "../models/list.model";
import Comment from "../models/comment.model";
import RecentBoard from "../models/recentBoards.model";

// GET /boards/recentBoards -> get recently visited 5 boards
export const getRecentBoards = async (req: any, res: Response) => {
  try {
    const recentBoards = await RecentBoard.find({ userId: req.user._id })
      .select("boardId lastVisited")
      .populate({
        path: "boardId",
        select: "_id name spaceId color bgImg visibility createdAt members",
        populate: {
          path: "spaceId",
          select: "_id name members",
        },
      })
      .sort({ lastVisited: -1 })
      .lean();

    let boards = recentBoards.filter((b) => {
      if (
        b.boardId.members
          .map((m: any) => m.memberId._id.toString())
          .includes(req.user._id.toString())
      ) {
        return b;
      } else {
        // not a board member
        // check with space role
        const role = b.boardId.spaceId.members.find(
          (m: any) => m.memberId.toString() === req.user._id.toString()
        ).role;

        // if NORMAL user in space, and board is private -> no access
        // if NORMAL user in space, and board is public -> access
        // if ADMIN, access
        // if GUEST, no access
        if (
          role === SPACE_MEMBER_ROLES.ADMIN ||
          (role === SPACE_MEMBER_ROLES.NORMAL &&
            b.boardId.visibility === BOARD_VISIBILITY.PUBLIC)
        ) {
          return b;
        }
      }
    });

    boards = boards.slice(0, 5);

    const finalBoards = [
      ...(await Promise.all(
        boards.map(async (b: any) => {
          const favorite = await Favorite.findOne({
            resourceId: b.boardId._id,
            userId: req.user._id,
            type: BOARD,
          });

          return {
            _id: b.boardId._id,
            name: b.boardId.name,
            color: b.boardId.color,
            spaceId: b.boardId.spaceId,
            bgImg: b.boardId.bgImg,
            visibility: b.boardId.visibility,
            isFavorite: favorite ? true : false,
            favoriteId: favorite && favorite._id,
            createdAt: b.boardId.createdAt,
          };
        })
      )),
    ];

    res.send({
      success: true,
      data: finalBoards,
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
    const newBoard = new Board({
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
      // add/update recentBoard
      const recentBoard = await RecentBoard.findOne({
        userId: req.user._id,
        boardId: board._id,
      });

      if (recentBoard) {
        recentBoard.lastVisited = Date.now();
        await recentBoard.save();
      } else {
        const newRecentBoard = new RecentBoard({
          userId: req.user._id,
          boardId: board._id,
        });
        await newRecentBoard.save();
      }

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

    // add/update recentBoard
    const recentBoard = await RecentBoard.findOne({
      userId: req.user._id,
      boardId: board._id,
    });

    if (recentBoard) {
      recentBoard.lastVisited = Date.now();
      await recentBoard.save();
    } else {
      const newRecentBoard = new RecentBoard({
        userId: req.user._id,
        boardId: board._id,
      });
      await newRecentBoard.save();
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

// PUT /boards/members/:id/bulk -> invite one or more members to the board
export const addBoardMembers = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { members, role } = req.body;

    let uniqueMemberIds: string[] = [];

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

    if (!role) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "role is required",
        statusCode: 400,
      });
    } else if (
      ![BOARD_MEMBER_ROLES.NORMAL, BOARD_MEMBER_ROLES.OBSERVER].includes(role)
    ) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "role should be either NORMAL or OBSERVER",
        statusCode: 400,
      });
    }

    if (!members) {
      // board members validation
      return res.status(400).send({
        success: false,
        data: {},
        message: "members array is required",
        statusCode: 400,
      });
    } else if (!Array.isArray(members) || !checkAllString(members)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "members value should be an array of _id(s)",
        statusCode: 400,
      });
    } else if (members.length === 0) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Please provide atleast a member _id inside array",
        statusCode: 400,
      });
    } else if (members.find((m) => !mongoose.isValidObjectId(m))) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid member _id(s)",
        statusCode: 400,
      });
    }

    // now we can trust, the members is an array and has atleast one valid _id
    // extract unique values
    uniqueMemberIds = getUniqueValues<string>(members);

    // remove empty strings from array
    uniqueMemberIds = uniqueMemberIds.filter((id) => id);

    if (uniqueMemberIds.length === 0) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid member _id(s)",
        statusCode: 400,
      });
    }

    // now we can asssure, we have some valid _id(s)

    // check a board with that _id exists
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    const space = await Space.findOne({ _id: board.spaceId._id }).select(
      "_id members"
    );

    // next check if the current user has the rights to do that
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );

    // conditions necessary for inviting
    // you should be either:
    // board ADMIN / NORMAL
    // space ADMIN / NORMAL + board PUBLIC
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
      // you can't invite other users
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found",
        statusCode: 404,
      });
    }

    // you are now eligible to see the board
    // now you should be either a boardMember or spaceMember
    // now check if you have the rights to invite
    if (
      boardMember &&
      ![BOARD_MEMBER_ROLES.ADMIN, BOARD_MEMBER_ROLES.NORMAL].includes(
        boardMember.role
      )
    ) {
      // you can't invite other users
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have the rights to invite users",
        statusCode: 403,
      });
    }

    // if they are not board member, but space NORMAL member and board is PUBLIC
    if (!boardMember && spaceMember.role === SPACE_MEMBER_ROLES.NORMAL) {
      // you must join first to invite a user
      return res.status(403).send({
        success: false,
        data: {},
        message: "You must join the board first to invite members",
        statusCode: 403,
      });
    }

    // if you reached this far, that means:
    // you are either a SPACE ADMIN / BOARD ADMIN / BOARD NORMAL
    const alreadyBoardMembers = board.members.map((m: any) =>
      m.memberId.toString()
    );
    const spaceAdmins = board.spaceId.members
      .filter((m: any) => m.role === SPACE_MEMBER_ROLES.ADMIN)
      .map((m: any) => m.memberId.toString());

    // filter out users who are already a board member
    uniqueMemberIds = uniqueMemberIds.filter(
      (id: any) => !alreadyBoardMembers.includes(id)
    );

    // now you have a fresh user id(s) who are not a part of this board
    let validMembers = await User.find({
      _id: { $in: uniqueMemberIds },
      emailVerified: true,
    })
      .select("_id")
      .lean();

    // array of string _id(s)
    validMembers = validMembers.map((m: any) => m._id.toString());

    // valid unique member _id(s) who are not part of board yet
    const valuesToInsert = validMembers.map((id: any) => {
      return {
        memberId: id,
        role: spaceAdmins.includes(id) ? BOARD_MEMBER_ROLES.ADMIN : role,
        fallbackRole: spaceAdmins.includes(id)
          ? BOARD_MEMBER_ROLES.ADMIN
          : role,
      };
    });

    // push them to the board members
    if (valuesToInsert.length > 0) {
      board.members.push(...valuesToInsert);
    }

    // changes to space
    // add whoever is not a part of space yet as SPACE GUEST
    const spaceMembers = board.spaceId.members.map((m: any) =>
      m.memberId.toString()
    );

    const validNotSpaceMembersYet = validMembers.filter(
      (id: any) => !spaceMembers.includes(id)
    );

    // add them as GUEST in space
    const valuesToInsertSpace = validNotSpaceMembersYet.map((m: any) => {
      return {
        memberId: m,
        role: SPACE_MEMBER_ROLES.GUEST,
      };
    });

    if (valuesToInsertSpace.length > 0) {
      space.members.push(...valuesToInsertSpace);
    }

    await board.save();
    await space.save();

    return res.send({
      success: true,
      data: {},
      message: "Members added to the board",
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

// PUT /boards/:id/members/:memberId -> update member role in board
export const updateMemberRole = async (req: any, res: Response) => {
  try {
    const { id, memberId } = req.params;
    const { newRole } = req.body;

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

    if (!memberId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "memberId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(memberId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid memberId",
        statusCode: 400,
      });
    }

    // validation for new role
    if (!newRole) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "newRole is required",
        statusCode: 400,
      });
    } else if (
      ![
        BOARD_MEMBER_ROLES.ADMIN,
        BOARD_MEMBER_ROLES.NORMAL,
        BOARD_MEMBER_ROLES.OBSERVER,
      ].includes(newRole)
    ) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "newRole should be either ADMIN/NORMAL/OBSERVER",
        statusCode: 400,
      });
    }

    // now we have the board _id & memberId & newRole
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check whether this board is visible to the current user first
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    // now it is clear that the current user can see this board
    // but that's not enough for the current user to update the member's role
    // only board ADMIN or space ADMIN can do this
    if (
      !(boardMember && boardMember.role === BOARD_MEMBER_ROLES.ADMIN) &&
      !(spaceMember && spaceMember.role === SPACE_MEMBER_ROLES.ADMIN)
    ) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to update a member role
    // check if the intended user exists as board member
    const targetMember = board.members.find(
      (m: any) => m.memberId.toString() === memberId
    );

    if (!targetMember) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "Such a member doesn't exists on this board",
        statusCode: 403,
      });
    }

    // check if that board member is a space ADMIN
    if (
      board.spaceId.members
        .filter((m: any) => m.role === SPACE_MEMBER_ROLES.ADMIN)
        .map((m: any) => m.memberId.toString())
        .includes(memberId)
    ) {
      return res.status(403).send({
        success: false,
        data: {},
        message:
          "A space ADMIN will always remain a board ADMIN, you can't toggle that.",
        statusCode: 403,
      });
    }

    const boardAdmins = board.members
      .filter((m: any) => m.role === BOARD_MEMBER_ROLES.ADMIN)
      .map((m: any) => m.memberId.toString());

    // if this person is the only board ADMIN
    if (boardAdmins.length === 1 && boardAdmins[0] === memberId) {
      return res.status(403).send({
        success: false,
        data: {},
        message:
          "You can’t change roles because there must be at least one admin.",
        statusCode: 403,
      });
    }

    // if you are now trying to change the the role of any user(including yours) to the same existing one
    if (newRole === targetMember.role) {
      return res.send({
        success: true,
        data: {},
        message: "The newRole is the already existing role. Nothing to change.",
        statusCode: 200,
      });
    }

    // 100% op allowed
    // update corresponding persons role
    board.members = board.members.map((m: any) => {
      if (m.memberId === targetMember.memberId) {
        m.role = newRole;
        m.fallbackRole = newRole;
        return m;
      }
      return m;
    });

    await board.save();

    res.send({
      success: true,
      data: {},
      message: "Role updated successfully.",
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

// DELETE /boards/:id/members/:memberId -> remove from this board
export const removeMember = async (req: any, res: Response) => {
  try {
    const { id, memberId } = req.params;

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

    if (!memberId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "memberId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(memberId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid memberId",
        statusCode: 400,
      });
    }

    // now we have the board _id & memberId
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility lists")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check whether this board is visible to the current user first
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    // now it is clear that the current user can see this board
    // but that's not enough for the current user to remove member
    // only board ADMIN or space ADMIN can do this
    if (
      !(boardMember && boardMember.role === BOARD_MEMBER_ROLES.ADMIN) &&
      !(spaceMember && spaceMember.role === SPACE_MEMBER_ROLES.ADMIN)
    ) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to remove a board member
    // check if the intended user exists as board member
    const targetMember = board.members.find(
      (m: any) => m.memberId.toString() === memberId
    );

    if (!targetMember) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "Such a member doesn't exists on this board",
        statusCode: 403,
      });
    }

    if (req.user._id.toString() === targetMember.memberId.toString()) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You can't remove yourself. Try leaving.",
        statusCode: 403,
      });
    }

    // now understood, you are a space ADMIN or board ADMIN and that target member is not you
    const boardAdmins = board.members
      .filter((m: any) => m.role === BOARD_MEMBER_ROLES.ADMIN)
      .map((m: any) => m.memberId.toString());

    // if this person is the only board ADMIN, that means you are not a board ADMIN but a space ADMIN
    // you can simply block this op or make you as a board ADMIN by replacing him (because you are a space ADMIN)
    // i am going to do the latter
    if (boardAdmins.length === 1 && boardAdmins[0] === memberId) {
      // replace you (space ADMIN as board ADMIN)
      board.members.push({
        memberId: req.user._id,
        role: BOARD_MEMBER_ROLES.ADMIN,
        fallbackRole: BOARD_MEMBER_ROLES.ADMIN,
      });
    }

    // 100% op allowed
    board.members = board.members.filter(
      (m: any) => m.memberId.toString() !== targetMember.memberId.toString()
    );

    // remove targetMember from all cards
    await Card.updateMany(
      {
        listId: { $in: board.lists },
        members: targetMember.memberId,
      },
      {
        $pull: { members: { $in: [targetMember.memberId] } },
      }
    );

    // check if the target member is a GUEST user of the space
    // if so, if he is only in this board, then remove him from the space as well
    const IsUserSpaceGuest = board.spaceId.members.find(
      (m: any) =>
        m.memberId.toString() === targetMember.memberId.toString() &&
        m.role === SPACE_MEMBER_ROLES.GUEST
    );

    if (IsUserSpaceGuest) {
      // check if he is a member of any other boards in this space
      // if so do nothing
      // or else, if he is only member of this board only, then remove him as a GUEST from space

      // find all other boards in this space in which the GUEST member we are going to remove is part of
      const partOfOtherBoards = await Board.find({
        _id: {
          $ne: board._id,
        },
        spaceId: board.spaceId._id,
        members: {
          $elemMatch: {
            memberId: targetMember.memberId,
          },
        },
      });

      if (partOfOtherBoards.length === 0) {
        //  the GUEST is not part of other boards, he is only part of this board
        board.spaceId.members = board.spaceId.members.filter(
          (m: any) => m.memberId.toString() !== targetMember.memberId.toString()
        );
      }
    }

    await board.save();
    await board.spaceId.save();

    res.send({
      success: true,
      data: {},
      message: "Member removed successfully!",
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

// DELETE /boards/:id/members -> leave from board
export const leaveFromBoard = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    let isSpacePart = true;

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

    // now we have the board _id
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility lists")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check whether this board is visible to the current user first
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    // now it is clear that the current user can see this board
    // now check if current user is a member of this board or not
    const targetMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );

    if (!targetMember) {
      return res.status(403).send({
        success: false,
        data: {},
        message:
          "You are not a member of this board. In order to leave, you must join first.",
        statusCode: 403,
      });
    }

    // now check if you are the only board ADMIN
    // if so block the op
    const boardAdmins = board.members
      .filter((m: any) => m.role === BOARD_MEMBER_ROLES.ADMIN)
      .map((m: any) => m.memberId.toString());

    if (
      boardAdmins.length === 1 &&
      boardAdmins[0] === targetMember.memberId.toString()
    ) {
      return res.status(403).send({
        success: false,
        data: {},
        message:
          "You can't leave the board, because there must be atleast one admin in the board.",
        statusCode: 403,
      });
    }

    // now you are good to go
    board.members = board.members.filter(
      (m: any) => m.memberId.toString() !== targetMember.memberId.toString()
    );

    // remove targetMember from all cards
    await Card.updateMany(
      {
        listId: { $in: board.lists },
        members: targetMember.memberId,
      },
      {
        $pull: { members: { $in: [targetMember.memberId] } },
      }
    );

    // remove you from space, if you are a GUEST and you are only a member of this board in this space
    const IsUserSpaceGuest = board.spaceId.members.find(
      (m: any) =>
        m.memberId.toString() === targetMember.memberId.toString() &&
        m.role === SPACE_MEMBER_ROLES.GUEST
    );

    if (IsUserSpaceGuest) {
      // check if he is a member of any other boards in this space
      // if so do nothing
      // or else, if he is only member of this board only, then remove him as a GUEST from space

      // find all other boards in this space in which the GUEST member we are going to remove is part of
      const partOfOtherBoards = await Board.find({
        _id: {
          $ne: board._id,
        },
        spaceId: board.spaceId._id,
        members: {
          $elemMatch: {
            memberId: targetMember.memberId,
          },
        },
      });

      if (partOfOtherBoards.length === 0) {
        isSpacePart = false;
        //  the GUEST is not part of other boards, he is only part of this board
        board.spaceId.members = board.spaceId.members.filter(
          (m: any) => m.memberId.toString() !== targetMember.memberId.toString()
        );
      }
    }

    await board.save();
    await board.spaceId.save();

    res.send({
      success: true,
      data: {
        isSpacePart: isSpacePart,
      },
      message: "Removed successfully from Board!",
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

// PUT /boards/:id/members/join -> join as board member
export const joinBoard = async (req: any, res: Response) => {
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

    // check a board with that _id exists
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // next check if the current user has the rights to do that
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );

    // if already a board member, then stop
    if (boardMember) {
      // you can't invite other users
      return res.status(403).send({
        success: false,
        data: {},
        message: "You are already a board member",
        statusCode: 403,
      });
    }

    // you are not a board member yet
    // if not a space member
    if (
      !spaceMember ||
      (spaceMember && spaceMember.role === SPACE_MEMBER_ROLES.GUEST) ||
      (spaceMember &&
        spaceMember.role === SPACE_MEMBER_ROLES.NORMAL &&
        board.visibility === BOARD_VISIBILITY.PRIVATE)
    ) {
      // you can't join the board, bcz you can't even see it exists
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found",
        statusCode: 404,
      });
    }

    //  now it is clear that you are not a board member yet and you are either a space ADMIN or space NORMAL user + board PUBLIC
    // so add him to the board members
    board.members.push({
      memberId: req.user._id,
      role: spaceMember.role,
      fallbackRole: spaceMember.role,
    });

    await board.save();

    res.send({
      success: true,
      data: {},
      message: "You are now a part of the board!",
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

// PUT /boards/:id/visibility -> update board visibility
export const changeBoardVisibility = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { newVisibility } = req.body;

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

    if (!newVisibility) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "newVisibility is required",
        statusCode: 400,
      });
    } else if (
      ![BOARD_VISIBILITY.PRIVATE, BOARD_VISIBILITY.PUBLIC].includes(
        newVisibility
      )
    ) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "newVisibility should be either PRIVATE/PUBLIC",
        statusCode: 400,
      });
    }

    // now we have the board _id & newVisibility
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check whether this board is visible to the current user first
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    // now it is clear that the current user can see this board
    // but that's not enough for the current user to update the board's visibility
    // only board ADMIN or space ADMIN can do this
    if (
      !(boardMember && boardMember.role === BOARD_MEMBER_ROLES.ADMIN) &&
      !(spaceMember && spaceMember.role === SPACE_MEMBER_ROLES.ADMIN)
    ) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to update the board's visibility
    //  update the board's visiblity
    if (board.visibility === newVisibility) {
      return res.send({
        success: true,
        data: {},
        message:
          "The new visibility is the already existing visibility. Nothing to change.",
        statusCode: 200,
      });
    }

    board.visibility = newVisibility;

    await board.save();

    res.send({
      success: true,
      data: {},
      message: "Board visibility updated successfully.",
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

// PUT /boards/:id/name -> update board name
export const updateBoardName = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

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

    // now we have the board _id & name
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check whether this board is visible to the current user first
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    // now it is clear that the current user can see this board
    // but that's not enough for the current user to update the board's name
    // only board ADMIN or space ADMIN can do this
    if (
      !(boardMember && boardMember.role === BOARD_MEMBER_ROLES.ADMIN) &&
      !(spaceMember && spaceMember.role === SPACE_MEMBER_ROLES.ADMIN)
    ) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // update board name
    board.name = validator.escape(name);

    await board.save();

    res.send({
      success: true,
      data: {},
      message: "Board name updated successfully.",
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

// PUT /boards/:id/description -> update board description
export const updateBoardDesc = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

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

    if (!Object.keys(req.body).includes("description")) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Board description is required",
        statusCode: 400,
      });
    } else if (description.length > 512) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Board name should be less than or equal to 512 chars",
        statusCode: 400,
      });
    }

    // now we have the board _id & description
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility description")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check whether this board is visible to the current user first
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    // check if you are either a ADMIN / NORMAL
    if (
      boardMember &&
      ![BOARD_MEMBER_ROLES.ADMIN, BOARD_MEMBER_ROLES.NORMAL].includes(
        boardMember.role
      )
    ) {
      // you can't edit description
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have the rights to edit the description",
        statusCode: 403,
      });
    }

    // now if you are a board member, then you must be ADMIN / NORMAL
    // else you are a space member and the role must be ADMIN / NORMAL (if board is PUBLIC)
    board.description = validator.escape(description);

    await board.save();

    return res.status(200).send({
      success: false,
      data: {},
      message: "Board description updated successfully",
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

// PUT /boards/:id/desc -> update board description
export const updateBoardBackground = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { bgImg, color } = req.body;

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

    // bgImg is not necessary, but if it is present, then make sure it is an url
    if (!Object.keys(req.body).includes("bgImg")) {
      return res.status(400).send({
        success: false,
        data: {},
        message:
          "bgImg is required, if no image then please provide an empty string as value",
        statusCode: 400,
      });
    } else if (
      bgImg &&
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

    // now we have the board _id & bgImg & color
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility color bgImg")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check whether this board is visible to the current user first
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    // check if you are either a ADMIN / NORMAL
    if (
      boardMember &&
      ![BOARD_MEMBER_ROLES.ADMIN, BOARD_MEMBER_ROLES.NORMAL].includes(
        boardMember.role
      )
    ) {
      // you can't update background
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have the rights to update the background",
        statusCode: 403,
      });
    }

    // now if you are a board member, then you must be ADMIN / NORMAL
    // else you are a space member and the role must be ADMIN / NORMAL (if board is PUBLIC)
    board.color = color;
    board.bgImg = bgImg;

    await board.save();

    return res.status(200).send({
      success: false,
      data: {},
      message: "Board background updated successfully",
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

// POST /boards/:id/labels -> create a new label
export const createNewLabel = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

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

    // name is optional
    if (name && name.legth > 512) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Label name should be less than or equal to 512 chars",
        statusCode: 400,
      });
    }

    // color validation
    if (!color) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Label color is required",
        statusCode: 400,
      });
    } else if (!Object.values(LABEL_COLORS).includes(color)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid value for label color",
        statusCode: 400,
      });
    }

    // every needed inputs are present
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members labels visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .populate({
        path: "labels",
        select: "_id name color boardId",
      });

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
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to create a label in this board
    // check for duplicate
    let alreadyExists = false;

    if (name) {
      // check for name & color
      alreadyExists = board.labels.find(
        (l: any) =>
          l.name === name &&
          l.color === color &&
          l.boardId.toString() === board._id.toString()
      )
        ? true
        : false;
    } else {
      // check for color
      alreadyExists = board.labels.find(
        (l: any) =>
          l.name === "" &&
          l.color === color &&
          l.boardId.toString() === board._id.toString()
      )
        ? true
        : false;
    }

    if (alreadyExists) {
      return res.status(409).send({
        success: false,
        data: {},
        message: "Label already exists",
        statusCode: 409,
      });
    }

    const pos = getPos(color);

    // create a new label & add it to the board
    const newLabel = new Label({
      color: color,
      pos: pos,
      boardId: board._id,
    });

    if (name) {
      newLabel.name = validator.escape(name);
    } else {
      newLabel.name = "";
    }

    board.labels.push(newLabel);

    await newLabel.save();
    await board.save();

    res.status(201).send({
      success: true,
      data: {
        _id: newLabel._id,
        name: newLabel.name,
        color: newLabel.color,
        pos: newLabel.pos,
      },
      message: "Label has been created successfully",
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

// PUT /boards/:id/labels -> update label
export const updateLabel = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { labelId } = req.body;
    const { name, color } = req.body;

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

    if (!labelId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "labelId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(labelId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid labelId",
        statusCode: 400,
      });
    }

    if (
      !Object.keys(req.body).includes("name") &&
      !Object.keys(req.body).includes("color")
    ) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Please provide name/color",
        statusCode: 400,
      });
    }

    // name is optional
    if (Object.keys(req.body).includes("name") && name.legth > 512) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Label name should be less than or equal to 512 chars",
        statusCode: 400,
      });
    }

    // color validation
    if (Object.keys(req.body).includes("color")) {
      if (!color) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Label color is required",
          statusCode: 400,
        });
      } else if (!Object.values(LABEL_COLORS).includes(color)) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Invalid value for label color",
          statusCode: 400,
        });
      }
    }

    // every needed inputs are present
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members labels lists visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .populate({
        path: "labels",
        select: "_id name color boardId",
      });

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
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to delete a label in this board
    // check if label exists or not
    const label = await Label.findOne({
      _id: labelId,
      boardId: board._id,
    }).select("_id name color pos");

    if (!label) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Label not found",
        statusCode: 404,
      });
    }

    // now you have the rights to create a label in this board
    // check for duplicate
    let alreadyExists = false;

    if (name) {
      // check for name & color
      alreadyExists = board.labels.find(
        (l: any) =>
          l.name === name &&
          l.color === color &&
          l._id.toString() !== label._id.toString() &&
          l.boardId.toString() === board._id.toString()
      )
        ? true
        : false;
    } else {
      // check for color
      alreadyExists = board.labels.find(
        (l: any) =>
          l.name === "" &&
          l.color === color &&
          l._id.toString() !== label._id.toString() &&
          l.boardId.toString() === board._id.toString()
      )
        ? true
        : false;
    }

    if (alreadyExists) {
      return res.status(409).send({
        success: false,
        data: {},
        message: "Label already exists",
        statusCode: 409,
      });
    }

    // update the label
    if (Object.keys(req.body).includes("color")) {
      label.color = color;
      label.pos = getPos(color);
    }

    if (Object.keys(req.body).includes("name")) {
      label.name = validator.escape(name);
    }

    await board.save();
    await label.save();

    res.send({
      success: true,
      data: {
        _id: label._id,
        name: label.name,
        color: label.color,
        pos: label.pos,
        isPresent: true,
      },
      message: "Label updated successfully",
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

// DELETE /boards/:id/labels -> remove label from board
export const removeLabel = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { labelId } = req.body;

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

    if (!labelId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "labelId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(labelId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid labelId",
        statusCode: 400,
      });
    }

    // every needed inputs are present
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members labels lists visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

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
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to delete a label in this board
    // check if label exists or not
    const label = await Label.findOne({
      _id: labelId,
      boardId: board._id,
    }).select("_id");

    if (!label) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Label not found",
        statusCode: 404,
      });
    }

    // such a label exists, so remove it from label & from board labels array & from all cards
    board.labels = board.labels.filter(
      (l: any) => l.toString() !== label._id.toString()
    );

    await Card.updateMany(
      {
        listId: { $in: board.lists },
        labels: label._id,
      },
      {
        $pull: { labels: { $in: [label._id] } },
      }
    );

    await board.save();
    await Label.deleteOne({
      _id: label._id,
    });

    res.send({
      success: true,
      data: {},
      message: "Label removed successfully",
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

// GET /boards/:id/labels -> get all board labels
export const getAllLabels = async (req: any, res: Response) => {
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

    // every needed inputs are present
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members labels visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .populate({
        path: "labels",
        select: "_id name color pos",
        options: {
          sort: { pos: 1 },
        },
      });

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
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    res.send({
      success: true,
      data: board.labels,
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

// DELETE /boards/:id -> delete board, lists, cards, comments, labels
export const deleteBoard = async (req: any, res: Response) => {
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

    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: id })
      .select("_id spaceId members visibility lists")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    if (!board) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Board not found!",
        statusCode: 404,
      });
    }

    // check whether this board is visible to the current user first
    const boardMember = board.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
    );
    const spaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === req.user._id.toString()
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

    // now it is clear that the current user can see this board
    // but that's not enough for the current user to delete a board
    // only board ADMIN or space ADMIN can do this
    if (
      !(boardMember && boardMember.role === BOARD_MEMBER_ROLES.ADMIN) &&
      !(spaceMember && spaceMember.role === SPACE_MEMBER_ROLES.ADMIN)
    ) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    const cards = await Card.find({ listId: { $in: board.lists } }).select(
      "_id"
    );

    // delete board, lists, cards, comments, labels, favorites
    await Board.deleteOne({ _id: board._id });
    await List.deleteMany({ boardId: board._id });
    await Card.deleteMany({ listId: { $in: board.lists } });
    await Comment.deleteMany({ cardId: { $in: cards } });

    await Label.deleteMany({ boardId: board._id });
    await Favorite.deleteOne({ resourceId: board._id, type: BOARD });

    // remove from recentBoard
    await RecentBoard.deleteMany({ boardId: board._id, userId: req.user._id });

    // remove board from space
    const space = await Space.findOne({ _id: board.spaceId._id }).select(
      "_id boards"
    );

    space.boards = space.boards.filter(
      (b: any) => b.toString() !== board._id.toString()
    );
    await space.save();

    res.send({
      success: true,
      data: {},
      message: "Board has been deleted successfully.",
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
