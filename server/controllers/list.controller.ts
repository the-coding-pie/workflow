import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";

// POST /lists -> create a new list
export const createList = async (req: any, res: Response) => {
  try {
    const { boardId, name, pos } = req.body;

    if (!boardId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "boardId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(boardId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid boardId",
        statusCode: 400,
      });
    }

    if (!name) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "List name is required",
        statusCode: 400,
      });
    } else if (name.length > 512) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "List name should be less than or equal to 512 chars",
        statusCode: 400,
      });
    }

    if (!pos) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "List pos is required",
        statusCode: 400,
      });
    } else if (!validator.isAscii(pos)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid value for pos",
        statusCode: 400,
      });
    }

    // every needed inputs are present
  } catch (err) {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};
