import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import { BOARD_VISIBILITY } from "../types/constants";
import Board from "../models/board.model";
import Card from "../models/card.model";
import Comment from "../models/comment.model";
import List from "../models/list.model";
import {
  BOARD_MEMBER_ROLES,
  LIST_POSSIBLE_DRAGS,
  SPACE_MEMBER_ROLES,
} from "../types/constants";
import { getProfile } from "../utils/helpers";
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
        select: "_id name pos",
        options: {
          sort: "pos",
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

    const cards = await Card.find({
      listId: { $in: board.lists.map((l: any) => l._id) },
    })
      .select(
        "_id name listId pos coverImg color dueDate members labels comments description isComplete"
      )
      .populate({
        path: "members",
        select: "_id username profile",
      })
      .populate({
        path: "labels",
        select: "_id name color pos",
      })
      .lean();

    // now it is clear that the current user can see this board
    // that's enough to send the lists
    res.send({
      success: true,
      data: {
        lists: board.lists,
        cards: cards.map((card: any) => {
          return {
            _id: card._id,
            listId: card.listId,
            pos: card.pos,
            coverImg: card.coverImg,
            color: card.color,
            name: card.name,
            labels: card.labels,

            description: card.description,
            isComplete: card.isComplete,
            dueDate: card.dueDate,
            members: card.members?.map((m: any) => {
              return {
                ...m,
                profile: getProfile(m.profile),
              };
            }),
            comments: card.comments?.length,
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

// PUT /lists/:id/name -> update board name
export const updateListName = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "list _id is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid list _id",
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

    // every needed inputs are present
    // check if the listId is valid and the user has right to see the board and update list name
    const list = await List.findOne({ _id: id }).select("_id name boardId");

    if (!list) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "List not found",
        statusCode: 404,
      });
    }

    // if list is present, then board will be also present
    const board = await Board.findOne({ _id: list.boardId })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    // check whether the user has the rights to update name of list -> ADMIN / NORMAL
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
    // but that's not enough for the current user to update a list's name in this board
    // only board member (ADMIN and NORMAL) or space member (ADMIN or NORMAL)
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // update the name
    list.name = validator.escape(name);

    await list.save();

    res.send({
      success: true,
      data: {},
      message: "List name updated successfully.",
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

// PUT /lists/:id/dnd -> drag and drop list
export const dndList = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { newPos, dir } = req.body;
    let finalPos: string;
    let refetch = false;

    if (!id) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "list _id is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid list _id",
        statusCode: 400,
      });
    }

    if (!newPos) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "List newPos is required",
        statusCode: 400,
      });
    } else if (!validator.isAscii(newPos)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid value for newPos",
        statusCode: 400,
      });
    }

    if (!dir) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "List drag dir is required",
        statusCode: 400,
      });
    } else if (!Object.keys(LIST_POSSIBLE_DRAGS).includes(dir)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "List drag dir should be either LEFT or RIGHT",
        statusCode: 400,
      });
    }

    // every needed inputs are present
    // check if the listId is valid and the user has right to see the board and update list name
    const list = await List.findOne({ _id: id }).select("_id name boardId pos");

    if (!list) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "List not found",
        statusCode: 404,
      });
    }

    // if list is present, then board will be also present
    const board = await Board.findOne({ _id: list.boardId })
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

    // check whether the user has the rights to dnd list -> ADMIN / NORMAL
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
    // but that's not enough for the current user to dnd a list
    // only board member (ADMIN and NORMAL) or space member (ADMIN or NORMAL)
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    finalPos = newPos;
    // update list's pos
    // but before that, check for pos conflict
    const conflictList = board.lists.find((l: any) => l.pos === newPos);

    if (conflictList) {
      // your ui is not up-to-date
      refetch = true;
    }

    if (conflictList && conflictList._id.toString() !== list._id.toString()) {
      // already some other list occupied that position
      // so recalculate the dragged list's pos
      const lexorank = new Lexorank();

      const conflictIndex = board.lists.indexOf((l: any) => l.pos === newPos);
      // for right drag
      const nextList = board.lists[conflictIndex + 1];
      // for left drag
      const prevList = board.lists[conflictIndex - 1];

      // if drag pos RIGHT, take next pos after conflict, else take prev pos before conflict
      if (dir === LIST_POSSIBLE_DRAGS.RIGHT) {
        // right most end
        if (!nextList) {
          const [newPos, ok] = lexorank.insert(conflictList.pos, "");

          finalPos = newPos;
        } else {
          // right drag (middle)
          const [newPos, ok] = lexorank.insert(conflictList.pos, nextList.pos);

          finalPos = newPos;
        }
      } else {
        // left drag
        // left most
        if (!prevList) {
          const [newPos, ok] = lexorank.insert("0", conflictList.pos);

          finalPos = newPos;
        } else {
          // left drag (middle)
          const [newPos, ok] = lexorank.insert(prevList.pos, conflictList.pos);

          finalPos = newPos;
        }
      }
    }

    // update list pos with newPos/finalPos
    list.pos = finalPos;

    await list.save();

    res.send({
      success: true,
      data: {
        _id: list._id,
        name: list.name,
        pos: list.pos,
        refetch: refetch,
      },
      message: "List position updated successfully!",
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

// DELETE /lists/:id -> delete list, cards, and comments
export const deleteList = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "list _id is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid list _id",
        statusCode: 400,
      });
    }

    const list = await List.findOne({ _id: id })
      .select("_id name boardId cards")
      .lean();

    if (!list) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "List not found",
        statusCode: 404,
      });
    }

    // if list is present, then board will be also present
    const board = await Board.findOne({ _id: list.boardId })
      .select("_id spaceId members visibility lists")
      .populate({
        path: "spaceId",
        select: "_id name members",
      });

    // check whether the user has the rights to update name of list -> ADMIN / NORMAL
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
    // but that's not enough for the current user to delete a list
    // only board member (ADMIN and NORMAL) or space member (ADMIN or NORMAL)
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // delete the list
    await List.deleteOne({ _id: list._id });
    // delete all cards and their comments
    await Card.deleteMany({ _id: { $in: list.cards } });
    await Comment.deleteMany({ cardId: { $in: list.cards } });

    // remove list from board
    board.lists = board.lists.filter(
      (l: any) => l.toString() !== list._id.toString()
    );
    await board.save();

    res.send({
      success: true,
      data: {},
      message: "List has been deleted successfully.",
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
