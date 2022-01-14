import { Response } from "express";
import mongoose from "mongoose";
import Project from "../models/project.model";
import User from "../models/user.model";
import { checkAllString, getUniqueValues } from "../utils/helpers";
import validator from "validator";
import { PROJECT_MEMBER_ROLES } from "../types/constants";

// POST /projects -> create a new project
export const createProject = async (req: any, res: Response) => {
  try {
    const { name, description, members } = req.body;
    let uniqueMemberIds: string[] = [];

    // project name validation
    if (!name) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Project name is required",
        statusCode: 400,
      });
    } else if (name.length > 100) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Project name should be less than or equal to 100 chars",
        statusCode: 400,
      });
    }

    // project members validation
    if (members) {
      if (
        !Array.isArray(members) ||
        !checkAllString(members)
      ) {
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

    // create a new project
    const newProject = new Project({
      name: validator.escape(name),
      creator: req.user._id,
    });

    // description
    if (description) {
      newProject.description = validator.escape(description);
    }

    // project members
    if (uniqueMemberIds.length > 0) {
      // get all valid users
      const validMembers = await User.find({
        _id: { $in: uniqueMemberIds },
      }).select("_id");

      let valuesToInsert = validMembers.map((m) => {
        return {
          memberId: m,
          role: PROJECT_MEMBER_ROLES.NORMAL,
        };
      });

      //   insert valid values
      newProject.members = valuesToInsert;
    }

    // add creator as ADMIN
    newProject.members.push({
      memberId: req.user._id,
      role: PROJECT_MEMBER_ROLES.ADMIN,
    });

    // save
    await newProject.save();

    res.status(201).send({
      success: true,
      data: {},
      message: "Project created successfully",
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
