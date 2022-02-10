import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import List from "../models/list.model";

// POST /cards -> create card
export const createCard = async (req: any, res: Response) => {
  try {
    const { listId, name, pos } = req.body;
    let finalPos: string;

    if (!listId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "listId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(listId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid listId",
        statusCode: 400,
      });
    }

    if (!name) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Card name is required",
        statusCode: 400,
      });
    } else if (name.length > 512) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Card name should be less than or equal to 512 chars",
        statusCode: 400,
      });
    }

    if (!pos) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Card pos is required",
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
    // check if the listId is valid and the user has right to see the board and create a card in it
  } catch (err) {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};
