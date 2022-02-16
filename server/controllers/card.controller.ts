import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import { BOARD_VISIBILITY } from "../dist/types/constants";
import Board from "../models/board.model";
import Card from "../models/card.model";
import List from "../models/list.model";
import {
  BOARD_MEMBER_ROLES,
  CARD_POSSIBLE_DRAGS,
  SPACE_MEMBER_ROLES,
} from "../types/constants";
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
        listId: card.listId,
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

// PUT /cards/:id/dnd -> drag and drop card
export const dndCard = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { newPos, destListId, dir } = req.body;
    let finalPos: string;
    let refetch = false;

    if (!id) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "card _id is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid card _id",
        statusCode: 400,
      });
    }

    if (!destListId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "destListId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(destListId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid destListId",
        statusCode: 400,
      });
    }

    if (!newPos) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Card newPos is required",
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

    // check if card _id is valid
    const card = await Card.findOne({ _id: id }).select("_id name listId pos");

    if (!card) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Card not found",
        statusCode: 404,
      });
    }

    // source list, if card is present, then list will be also present
    const sourceList = await List.findOne({ _id: card.listId })
      .select("_id boardId cards")
      .populate({
        path: "cards",
        select: "_id pos",
        options: {
          sort: "pos",
        },
      });

    // if list is present, then board will be also present
    const board = await Board.findOne({ _id: sourceList.boardId })
      .select("_id spaceId members lists visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
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
        message: "Card not found",
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

    // check if destListId is valid
    const destList = await List.findOne({ _id: destListId })
      .select("_id boardId cards")
      .populate({
        path: "cards",
        select: "_id pos",
        options: {
          sort: "pos",
        },
      });

    if (!destList) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Destination List not found",
        statusCode: 404,
      });
    } else if (sourceList.boardId.toString() !== destList.boardId.toString()) {
      return res.status(403).send({
        success: false,
        data: {},
        message:
          "You can't drag and drop a card to a list which belongs to a different board",
        statusCode: 403,
      });
    }

    // check if source list _id === destListId
    if (sourceList._id.toString() === destList._id.toString()) {
      // they are dnd on same list
      // make sure dir is given
      if (!dir) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Card drag direction is required",
          statusCode: 400,
        });
      } else if (!Object.keys(CARD_POSSIBLE_DRAGS).includes(dir)) {
        return res.status(400).send({
          success: false,
          data: {},
          message: "Card drag direction should be either UP or DOWN",
          statusCode: 400,
        });
      }
    }

    // if you reached here, you can assure that you have all the required inputs -> newPos, destList, dir (if source list and destList are equal), card, and it is clear that source list and destination list belongs to the same board

    // you also have the permission to do this op

    // now determining valid finalPos for card

    finalPos = newPos;

    // checking for conflict of same pos as of newPos, if true, then pick a new finalPos
    // dnd of cards can occur in one of two ways -> same list or different list
    // dnd in same list itself
    if (sourceList._id.toString() === destList._id.toString()) {
      // check if the newPos is already taken by some other cards
      const conflictCard = sourceList.cards.find((c: any) => c.pos === newPos);

      if (conflictCard) {
        // your ui is not up-to-date
        refetch = true;
      }

      if (conflictCard && conflictCard._id.toString() !== card._id.toString()) {
        // already some other card occupied that position
        // so recalculate the dragged card's pos, you don't have to use the newPos which was given
        const lexorank = new Lexorank();

        const conflictIndex = sourceList.cards.indexOf(
          (c: any) => c.pos === newPos
        );
        const topCard = sourceList.cards[conflictIndex - 1];
        const bottomCard = sourceList.cards[conflictIndex + 1];

        // if dir is UP, take topCard or else bottomCard
        if (dir === CARD_POSSIBLE_DRAGS.UP) {
          // top most
          if (!topCard) {
            const [newPos, ok] = lexorank.insert("0", conflictCard.pos);

            finalPos = newPos;
          } else {
            // middle
            const [newPos, ok] = lexorank.insert(topCard.pos, conflictCard.pos);

            finalPos = newPos;
          }
        } else {
          // dragging DOWN
          // bottom end
          if (!bottomCard) {
            const [newPos, ok] = lexorank.insert(conflictCard.pos, "");

            finalPos = newPos;
          } else {
            // middle
            const [newPos, ok] = lexorank.insert(
              conflictCard.pos,
              bottomCard.pos
            );

            finalPos = newPos;
          }
        }
      }
    } else {
      // different list
      // check if the newPos is already taken by some other cards
      const conflictCard = destList.cards.find((c: any) => c.pos === newPos);

      if (conflictCard) {
        // your ui is not up-to-date
        refetch = true;
      }

      if (conflictCard && conflictCard._id.toString() !== card._id.toString()) {
        // already some other card occupied that position
        // so recalculate finalPos
        const lexorank = new Lexorank();

        const conflictIndex = destList.cards.indexOf(
          (c: any) => c.pos === newPos
        );
        const topCard = destList.cards[conflictIndex - 1];
        const bottomCard = destList.cards[conflictIndex + 1];

        // if destList cards length === 1
        if (destList.cards.length === 1) {
          // put your card below that card
          const [newPos, ok] = lexorank.insert("0", conflictCard.pos);

          finalPos = newPos;
        } else {
          // more cards present
          // now there are many cards,
          // possibilities => very top, very bottom, or middle
          // very top
          if (conflictIndex === 0) {
            const [newPos, ok] = lexorank.insert("0", conflictCard.pos);

            finalPos = newPos;
          } else if (conflictIndex === destList.cards.length - 1) {
            // very bottom
            const [newPos, ok] = lexorank.insert(conflictCard.pos, "");

            finalPos = newPos;
          } else {
            // middle
            const [newPos, ok] = lexorank.insert(topCard.pos, conflictCard.pos);

            finalPos = newPos;
          }
        }
      }
    }

    // now we mayhave got a newPos if there was any conflict exist
    card.pos = finalPos;

    // if you are dragging from one list to another, we need to update the list cards array
    // remove the card id which was dragged from source list cards array and put it inside destList cards array
    // also update that card's listId
    if (sourceList._id.toString() !== destList._id.toString()) {
      // remove dragged card from sourceList
      sourceList.cards = sourceList.cards.filter(
        (c: any) => c._id.toString() !== card._id.toString()
      );
      destList.cards.push(card._id);

      // update card's listId
      card.listId = destList._id;
    }

    await sourceList.save();
    await destList.save();
    await card.save();

    res.send({
      success: true,
      data: {
        _id: card._id,
        name: card.name,
        pos: card.pos,
        refetch: refetch,
      },
      message: "Card position updated successfully.",
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

// GET /cards/:id -> get a card
export const getCard = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    let role: string;

    if (!id) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "card _id is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid card _id",
        statusCode: 400,
      });
    }

    // check if card _id is valid
    const card = await Card.findOne({ _id: id })
      .select(
        "_id name listId pos description cover dueDate members labels comments"
      )
      .populate({
        path: "members",
        select: "_id username profile",
      })
      .populate({
        path: "comments",
        select: "_id comment user",
        populate: {
          path: "user",
          select: "_id username profile",
        },
      })
      .populate({
        path: "labels",
        select: "_id name color",
      })
      .lean();

    if (!card) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Card not found",
        statusCode: 404,
      });
    }

    // corresponding list
    const list = await List.findOne({ _id: card.listId })
      .select("_id boardId")
      .lean();

    // board
    const board = await Board.findOne({ _id: list.boardId })
      .select("_id spaceId members lists visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
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
        message: "Card not found",
        statusCode: 404,
      });
    }

    // he is either a board member or space member or both
    if (boardMember) {
      role = boardMember.role;
    } else {
      role = spaceMember.role;
    }

    // send the card info
    res.send({
      success: true,
      data: {
        _id: card._id,
        listId: card.listId,
        pos: card.pos,
        cover: card.cover,
        name: card.name,
        dueDate: card.dueDate,
        description: card.description,
        members: card.members,
        labels: card.labels,
        comments: card.comments,
        role: role,
      },
      message: "",
      statusCode: 200,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};

// POST /cards/:id/comments -> create new comment
export const createComment = async (req: any, res: Response) => {
  try {
  } catch (err) {
    res.status(500).send({
      success: false,
      data: {},
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};
