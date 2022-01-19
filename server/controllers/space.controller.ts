import { Response } from "express";
import mongoose from "mongoose";
import Space from "../models/space.model";
import User from "../models/user.model";
import { checkAllString, getUniqueValues } from "../utils/helpers";
import validator from "validator";
import { SPACE_MEMBER_ROLES } from "../types/constants";

// GET /spaces -> get space and its corresponding boards

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
      data: {},
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
