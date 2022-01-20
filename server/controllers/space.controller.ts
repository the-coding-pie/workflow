import { Response } from "express";
import mongoose from "mongoose";
import Space from "../models/space.model";
import User from "../models/user.model";
import { checkAllString, getUniqueValues } from "../utils/helpers";
import validator from "validator";
import {
  BOARD_MEMBER_ROLES,
  BOARD_VISIBILITY,
  SPACE_MEMBER_ROLES,
} from "../types/constants";
import { isAfter, isEqual } from "date-fns";

// GET /spaces -> get space and its corresponding boards
export const getSpaces = async (req: any, res: Response) => {
  try {
    // find all spaces in which i am an admin/normal/guest
    const allSpaces = await Space.find({
      members: {
        $elemMatch: {
          memberId: req.user._id,
        },
      },
    })
      .select("_id name icon isFavorite")
      .lean()
      .populate("members")
      .populate({
        path: "boards",
        select: "_id name isFavorite color members visibility createdAt",
      })
      .sort({ createdAt: 1 });

    const neededSpaceDetails = allSpaces.map((space: any) => {
      // find current user's role in this space role
      const role = space.members.find(
        (m: any) => m.memberId.toString() === req.user._id.toString()
      ).role;

      // split boards into two -> current user is actual member, not actual member
      const myBoards = space.boards.filter((board: any) =>
        board.members
          .map((m: any) => m.memberId.toString())
          .includes(req.user._id.toString())
      );
      // boards other than i am part of
      const notMyBoards = space.boards.filter(
        (board: any) =>
          !myBoards
            .map((b: any) => b._id.toString())
            .includes(board._id.toString())
      );

      // if current user is admin of space, show them all boards, board role determine -> take corresponding role from boards which he is member of + set isMember=true and for rest of the boards, give his role=ADMIN + set isMember=false
      if (role === SPACE_MEMBER_ROLES.ADMIN) {
        const totalBoards = [
          ...myBoards.map((b: any) => ({
            _id: b._id,
            name: b.name,
            isMember: true,
            color: b.color,
            visibility: b.visibility,
            isFavorite: b.isFavorite,
            createdAt: b.createdAt,
            role: b.members.find(
              (board: any) =>
                board.memberId.toString() === req.user._id.toString()
            ).role,
          })),
          ...notMyBoards.map((b: any) => ({
            _id: b._id,
            name: b.name,
            visibility: b.visibility,
            isFavorite: b.isFavorite,
            createdAt: b.createdAt,
            isMember: false,
            color: b.color,
            role: BOARD_MEMBER_ROLES.ADMIN,
          })),
        ].sort(function (a: any, b: any) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return isEqual(b.createdAt, a.createdAt)
            ? 0
            : isAfter(b.createdAt, a.createdAt)
            ? -1
            : 1;
        });

        return {
          _id: space._id,
          name: space.name,
          role: role,
          isFavorite: space.isFavorite,
          icon: space.icon,
          boards: totalBoards.map((b: any) => {
            return {
              _id: b._id,
              name: b.name,
              isMember: b.isMember,
              color: b.color,
              visibility: b.visibility,
              isFavorite: b.isFavorite,
              role: b.role
            }
          }),
        };
      } else if (role === SPACE_MEMBER_ROLES.NORMAL) {
        // if current user is normal user in space, find all board which he is part of and take corresponding roles from them + set isMember = true, then take only public boards from otherBoards and set role=NORMAL + set isMember=false
        const totalBoards = [
          ...myBoards.map((b: any) => ({
            _id: b._id,
            name: b.name,
            isMember: true,
            visibility: b.visibility,
            isFavorite: b.isFavorite,
            color: b.color,
            role: b.members.find(
              (board: any) =>
                board.memberId.toString() === req.user._id.toString()
            ).role,
          })),
          ...notMyBoards
            .filter((b: any) => b.visibility === BOARD_VISIBILITY.PUBLIC)
            .map((b: any) => ({
              _id: b._id,
              name: b.name,
              isMember: false,
              visibility: b.visibility,
              isFavorite: b.isFavorite,
              color: b.color,
              role: BOARD_MEMBER_ROLES.NORMAL,
            })),
        ].sort(function (a: any, b: any) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return isEqual(b.createdAt, a.createdAt)
            ? 0
            : isAfter(b.createdAt, a.createdAt)
            ? -1
            : 1;
        });

        return {
          _id: space._id,
          name: space.name,
          isFavorite: space.isFavorite,
          role: role,
          icon: space.icon,
          boards: totalBoards.map((b: any) => {
            return {
              _id: b._id,
              name: b.name,
              isMember: b.isMember,
              color: b.color,
              visibility: b.visibility,
              isFavorite: b.isFavorite,
              role: b.role
            }
          }),
        };
      } else if (role === SPACE_MEMBER_ROLES.GUEST) {
        // if current user is guest user in space, find all board which he is part of and take corresponding roles from them + set isMember = true, that's it
        const totalBoards = [
          ...myBoards.map((b: any) => ({
            _id: b._id,
            name: b.name,
            isMember: true,
            visibility: b.visibility,
            isFavorite: b.isFavorite,
            color: b.color,
            role: b.members.find(
              (board: any) =>
                board.memberId.toString() === req.user._id.toString()
            ).role,
          })),
        ].sort(function (a: any, b: any) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return isEqual(b.createdAt, a.createdAt)
            ? 0
            : isAfter(b.createdAt, a.createdAt)
            ? -1
            : 1;
        });

        return {
          _id: space._id,
          name: space.name,
          role: role,
          isFavorite: space.isFavorite,
          icon: space.icon,
          boards: totalBoards.map((b: any) => {
            return {
              _id: b._id,
              name: b.name,
              isMember: b.isMember,
              color: b.color,
              visibility: b.visibility,
              isFavorite: b.isFavorite,
              role: b.role
            }
          }),
        };
      }
    });

    res.send({
      success: true,
      data: neededSpaceDetails,
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

// POST /spaces -> create a new space
export const createSpace = async (req: any, res: Response) => {
  try {
    const { name, description, members } = req.body;

    let uniqueMemberIds: string[] = [];

    // space name validation
    if (!name) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Space name is required",
        statusCode: 400,
      });
    } else if (name.length > 100) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Space name should be less than or equal to 100 chars",
        statusCode: 400,
      });
    }

    if (description && description.length > 255) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Space description should be less than or equal to 255 chars",
        statusCode: 400,
      });
    }

    // space members validation
    if (members) {
      if (!Array.isArray(members) || !checkAllString(members)) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "members value should be an array of _id(s)",
          statusCode: 400,
        });
      } else if (members.length > 0) {
        // check if each memberId is valid
        if (members.find((m) => !mongoose.isValidObjectId(m))) {
          return res.status(400).send({
            success: false,
            data: {},
            message: "Invalid member _id(s)",
            statusCode: 400,
          });
        }

        // extract unique values
        // remove the creator's _id
        uniqueMemberIds = getUniqueValues<string>(members).filter(
          (m) => m !== req.user._id.toString()
        );

        // remove empty strings from array
        uniqueMemberIds = uniqueMemberIds.filter((id) => id);
      }
    }

    // create a new Space
    const newSpace = new Space({
      name: validator.escape(name),
      creator: req.user._id,
    });

    // description
    if (description) {
      newSpace.description = validator.escape(description);
    }

    // space members
    if (uniqueMemberIds.length > 0) {
      // get all valid users
      const validMembers = await User.find({
        _id: { $in: uniqueMemberIds },
        emailVerified: true,
      }).select("_id");

      let valuesToInsert = validMembers.map((m) => {
        return {
          memberId: m,
          role: SPACE_MEMBER_ROLES.NORMAL,
        };
      });

      // insert valid values
      newSpace.members = valuesToInsert;
    }

    // add creator as ADMIN
    newSpace.members.push({
      memberId: req.user._id,
      role: SPACE_MEMBER_ROLES.ADMIN,
    });

    // save
    await newSpace.save();

    res.status(201).send({
      success: true,
      data: {
        _id: newSpace._id,
        name: newSpace.name,
        role: SPACE_MEMBER_ROLES.ADMIN,
        isFavorite: newSpace.isFavorite,
        icon: newSpace.icon,
        boards: [],
      },
      message: "Space created successfully",
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

// GET /spaces/mine -> get all spaces in which the user is either an admin/normal member
export const getSpacesMine = async (req: any, res: Response) => {
  try {
    const mySpaces = await Space.find({
      members: {
        $elemMatch: {
          memberId: req.user._id,
          role: {
            $in: [SPACE_MEMBER_ROLES.ADMIN, SPACE_MEMBER_ROLES.NORMAL],
          },
        },
      },
    }).select("_id name");

    res.send({
      success: true,
      data: mySpaces,
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
