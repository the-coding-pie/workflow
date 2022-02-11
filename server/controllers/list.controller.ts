import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import { BOARD_VISIBILITY } from "../dist/types/constants";
import Board from "../models/board.model";
import List from "../models/list.model";
import { BOARD_MEMBER_ROLES, SPACE_MEMBER_ROLES } from "../types/constants";
import { Lexorank } from "../utils/lexorank";

// POST /lists -> create a new list
export const createList = async (req: any, res: Response) => {
  try {
    const { boardId, name, pos } = req.body;
    let finalPos: string;
    let refetch = false;

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
    // check if the board is valid & check current user has the rights to do this
    const board = await Board.findOne({ _id: boardId })
      .select("_id spaceId members lists visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .populate({
        path: "lists",
        select: "_id pos",
        options: {
          sort: "pos",
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

    // now it is clear that the current user can see this board
    // but that's not enough for the current user to create a list in board
    // only board member (ADMIN and NORMAL) or space member (ADMIN or NORMAL)
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to create a list in board
    finalPos = pos;

    // check pos is already taken
    const lists = board.lists;

    // if there is a conflict
    if (lists.find((l: any) => l.pos === pos)) {
      refetch = true;
      // so the position is already taken
      // now create a pos after last list element
      const lexorank = new Lexorank();
      const lastEl = lists.at(-1);

      const [newPos, ok] = lexorank.insert(lastEl.pos, "");

      finalPos = newPos;
    }

    // creating a list
    const list = new List({
      name: validator.escape(name),
      boardId: board._id,
      pos: finalPos,
      creator: req.user._id,
    });

    // add this list to board lists array
    board.lists.push(list._id);

    await list.save();
    await board.save();

    res.status(201).send({
      success: true,
      data: {
        _id: list._id,
        name: list.name,
        pos: list.pos,
        refetch: refetch,
      },
      message: "New List has been created!",
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

// GET /lists?boardId="boardId" -> get all lists under board
export const getLists = async (req: any, res: Response) => {
  try {
    const { boardId } = req.query;

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

    // check for the board
    const board = await Board.findOne({ _id: boardId })
      .select("_id spaceId members lists visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .populate({
        path: "lists",
        select: "_id name pos cards",
        options: {
          sort: "pos",
        },
        populate: {
          path: "cards",
          select: "_id name description pos listId",
          options: {
            sort: "pos",
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

    // final lists & cards
    let allCards: any[] = [];

    board.lists.forEach((l: any) => {
      allCards = [...allCards, ...l.cards];
    });

    let allLists: any[] = board.lists.map((l: any) => {
      delete l.cards;
      return l;
    });

    // now it is clear that the current user can see this board
    // that's enough to send the lists
    res.send({
      success: true,
      data: {
        lists: allLists,
        cards: allCards,
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
