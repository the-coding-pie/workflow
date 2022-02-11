import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import { BOARD_VISIBILITY } from "../dist/types/constants";
import Board from "../models/board.model";
import Card from "../models/card.model";
import List from "../models/list.model";
import { BOARD_MEMBER_ROLES, SPACE_MEMBER_ROLES } from "../types/constants";
import { Lexorank } from "../utils/lexorank";

// POST /cards -> create card
export const createCard = async (req: any, res: Response) => {
  try {
    const { listId, name, pos } = req.body;
    let finalPos: string;
    let refetch = false;

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
    const list = await List.findOne({ _id: listId })
      .select("_id boardId cards")
      .populate({
        path: "cards",
        select: "_id pos",
        options: {
          sort: "pos",
        },
      });

    if (!list) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "List not found",
        statusCode: 404,
      });
    }

    const board = await Board.findOne({ _id: list.boardId })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    // // unnecessary check below
    // if (!board) {
    //   return res.status(404).send({
    //     success: false,
    //     data: {},
    //     message: "List not found!",
    //     statusCode: 404,
    //   });
    // }

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
        message: "List not found",
        statusCode: 404,
      });
    }

    // now it is clear that the current user can see this board
    // but that's not enough for the current user to create a card in the list in this board
    // only board member (ADMIN and NORMAL) or space member (ADMIN or NORMAL)
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to create a card in the list of the board
    finalPos = pos;

    // check pos is already taken
    const cards = list.cards;

    if (cards.find((c: any) => c.pos === pos)) {
      refetch = true;

      // so the position is already taken
      // now create a pos after last card element
      const lexorank = new Lexorank();
      const lastEl = cards.at(-1);

      const [newPos, ok] = lexorank.insert(lastEl.pos, "");

      finalPos = newPos;
    }

    // create a card
    const card = new Card({
      name: validator.escape(name),
      listId: list._id,
      pos: finalPos,
      creator: req.user._id,
    });

    // push the card to the list
    list.cards.push(card._id);

    await card.save();
    await list.save();

    res.status(201).send({
      success: true,
      data: {
        _id: card._id,
        name: card.name,
        pos: card.pos,
        refetch: refetch,
      },
      message: "New Card has been created!",
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
