import { Response } from "express";
import mongoose from "mongoose";
import validator from "validator";
import {
  BASE_PATH_COMPLETE,
  PROFILE_PICS_DIR_NAME,
  STATIC_PATH,
} from "../config";
import { BOARD_VISIBILITY } from "../types/constants";
import Board from "../models/board.model";
import Card from "../models/card.model";
import Comment from "../models/comment.model";
import List from "../models/list.model";
import {
  BOARD_MEMBER_ROLES,
  CARD_POSSIBLE_DRAGS,
  LABEL_COLORS,
  SPACE_MEMBER_ROLES,
} from "../types/constants";
import { Lexorank } from "../utils/lexorank";
import path from "path";
import { getPos, getProfile } from "../utils/helpers";
import Label from "../models/label.model";
import datefns from "date-fns";
import User from "../models/user.model";

// GET /cards/all -> get all my cards
export const getAllCards = async (req: any, res: Response) => {
  try {
    const allMyCards = await Card.find({ members: { $in: req.user._id } })
      .select(
        "_id name listId pos coverImg color dueDate members labels comments description isComplete updatedAt"
      )
      .populate({
        path: "listId",
        select: "boardId",
        populate: {
          path: "boardId",
          select: "_id spaceId",
        },
      })
      .populate({
        path: "members",
        select: "_id username profile",
      })
      .populate({
        path: "labels",
        select: "_id name color pos",
      })
      .sort({ updatedAt: -1 })
      .lean();

    res.send({
      success: true,
      data: allMyCards.map((card: any) => {
        return {
          _id: card._id,
          listId: card.listId._id,
          pos: card.pos,
          coverImg: card.coverImg,
          color: card.color,
          name: card.name,
          labels: card.labels,
          boardId: card.listId.boardId._id,
          spaceId: card.listId.boardId.spaceId,
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
        "_id name listId pos description coverImg color dueDate members labels comments isComplete"
      )
      .populate({
        path: "members",
        select: "_id username profile",
      })
      .populate({
        path: "comments",
        select: "_id comment createdAt user isUpdated",
        populate: {
          path: "user",
          select: "_id username profile",
        },
        options: {
          sort: { createdAt: -1 },
        },
      })
      .populate({
        path: "labels",
        select: "_id name color pos",
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
        coverImg: card.coverImg,
        color: card.color,
        name: card.name,
        isComplete: card.isComplete,
        dueDate: card.dueDate,
        description: card.description,
        members: card.members?.map((m: any) => {
          return {
            ...m,
            profile: getProfile(m.profile),
          };
        }),
        labels: card.labels,
        comments: card.comments?.map((c: any) => {
          return {
            ...c,
            user: {
              ...c.user,
              profile: getProfile(c.user.profile),
              isAdmin:
                board.members.find(
                  (m: any) =>
                    m.memberId.toString() === c.user._id.toString() &&
                    m.role === BOARD_MEMBER_ROLES.ADMIN
                ) ||
                board.spaceId.members.find(
                  (m: any) =>
                    m.memberId.toString() === c.user._id.toString() &&
                    m.role === SPACE_MEMBER_ROLES.ADMIN
                )
                  ? true
                  : false,
            },
          };
        }),
        role: role,
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

// PUT /cards/:id/name -> update card name
export const updateCardName = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

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

    if (!name) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "card name is required",
        statusCode: 400,
      });
    } else if (name.length > 512) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "card name should be less than or equal to 512 chars",
        statusCode: 400,
      });
    }

    const card = await Card.findOne({ _id: id }).select("_id name listId");

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

    // check whether the user has the rights to update card name -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // update the name
    card.name = validator.escape(name);

    await card.save();

    res.send({
      success: true,
      data: {},
      message: "Card name updated successfully.",
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

// PUT /cards/:id/description -> update card description
export const updateCardDescription = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

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

    const card = await Card.findOne({ _id: id }).select(
      "_id description listId"
    );

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

    // check whether the user has the rights to update card description -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // update the description
    card.description = validator.escape(description);

    await card.save();

    res.send({
      success: true,
      data: {},
      message: "Card description updated successfully.",
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

// PUT /cards/:id/members -> add a member to card
export const addAMember = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

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

    const card = await Card.findOne({ _id: id }).select("_id listId members");

    if (!card) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Card not found",
        statusCode: 404,
      });
    }

    const list = await List.findOne({ _id: card.listId })
      .select("_id boardId")
      .lean();

    // board
    const board = await Board.findOne({ _id: list.boardId })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id members",
      });

    // check whether the user has the rights to add card member -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now it is clear that, you can add a card member
    // check memberId is valid
    let allMembers = [];

    const boardMembers = board.members.map((m: any) => m.memberId.toString());
    const spaceMembers = board.spaceId.members
      .filter((m: any) => !boardMembers.includes(m.memberId.toString()))
      .filter((m: any) => m.role !== SPACE_MEMBER_ROLES.GUEST)
      .map((m: any) => m.memberId.toString());

    allMembers = [...boardMembers, ...spaceMembers];

    // take if only if they are not a card member already & make sure they already present in all member
    if (!allMembers.includes(memberId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Please add the member as board member or space member first",
        statusCode: 400,
      });
    }

    // now it is clear that, the memberId is a valid one
    // if they are not a card member already, then only add them to the card
    if (card.members.map((m: any) => m.toString()).includes(memberId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Already added to card!",
        statusCode: 400,
      });
    }

    // add them to card
    card.members.push(memberId);

    await card.save();

    const newMember = await User.findOne({ _id: memberId })
      .select("_id username profile")
      .lean();

    return res.send({
      success: true,
      data: {
        _id: newMember._id,
        username: newMember.username,
        profile: getProfile(newMember.profile),
      },
      message: "Member added to card",
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

// DELETE /cards/:id/members -> remove member from card
export const removeCardMember = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

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

    const card = await Card.findOne({ _id: id }).select("_id listId members");

    if (!card) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Card not found",
        statusCode: 404,
      });
    }

    const list = await List.findOne({ _id: card.listId })
      .select("_id boardId")
      .lean();

    // board
    const board = await Board.findOne({ _id: list.boardId })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id members",
      });

    // check whether the user has the rights to add card member -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // you have the rights to remove the member from the card
    // remove the member if he is already a card member
    if (!card.members.map((m: any) => m.toString()).includes(memberId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Please add the member to card first",
        statusCode: 400,
      });
    }

    // it is clear that, he is a card member
    card.members = card.members.filter((m: any) => m.toString() !== memberId);

    await card.save();

    res.send({
      success: true,
      data: {},
      message: "Member removed from card",
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

// GET /cards/:id/labels -> get all labels in board with ticks if it belongs to this card
export const getCardLabels = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

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

    const card = await Card.findOne({ _id: id })
      .select("_id listId labels")
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
      })
      .lean();

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

    const cardLabelsIds = card.labels
      ? card.labels.map((l: any) => l.toString())
      : [];

    // send the info
    res.send({
      success: true,
      data: board.labels.map((l: any) => {
        return {
          ...l,
          isPresent: cardLabelsIds.includes(l._id.toString()),
        };
      }),
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

// PUT /cards/:id/labels -> add new label to card
export const addCardLabel = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { labelId } = req.body;

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

    const card = await Card.findOne({ _id: id }).select("_id listId labels");

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
      })
      .lean();

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

    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the permission to do this
    // now check if the label is valid and it doesn't exists on card already
    if (!board.labels.map((l: any) => l._id.toString()).includes(labelId)) {
      // invalid label
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid label",
        statusCode: 400,
      });
    }

    // now check if the label already exists on the card
    if (card.labels.map((l: any) => l.toString()).includes(labelId)) {
      return res.status(409).send({
        success: false,
        data: {},
        message: "Label already added to card",
        statusCode: 409,
      });
    }

    // the label is valid, and not already present in card
    card.labels.push(labelId);

    await card.save();

    const l = board.labels.find((l: any) => l._id.toString() === labelId);

    res.send({
      success: true,
      data: {
        _id: l._id,
        name: l.name,
        color: l.color,
        pos: l.pos,
      },
      message: "Label added to card",
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

// DELETE /cards/:id/labels -> remove label from card
export const removeCardLabel = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { labelId } = req.body;

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

    const card = await Card.findOne({ _id: id }).select("_id listId labels");

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
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

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

    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you have the rights to do this
    // now check if the label already present in card
    if (!card.labels.map((l: any) => l.toString()).includes(labelId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Label not present in card",
        statusCode: 400,
      });
    }

    // label present in card
    // now remove it
    card.labels = card.labels.filter((l: any) => l.toString() !== labelId);

    await card.save();

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

// POST /cards/:id/labels -> create label
export const createLabel = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

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

    const card = await Card.findOne({ _id: id }).select("_id listId labels");

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
      .select("_id spaceId members labels visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .populate({
        path: "labels",
        select: "_id name color boardId",
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

    card.labels.push(newLabel);
    board.labels.push(newLabel);

    await newLabel.save();
    await board.save();
    await card.save();

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

// POST /cards/:id/comments -> create new comment
export const createComment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

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

    if (!comment) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "comment cannot be empty",
        statusCode: 400,
      });
    }

    const card = await Card.findOne({ _id: id }).select("_id listId comments");

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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // now you can create a comment in this card
    const newComment = new Comment({
      comment: validator.escape(comment),
      user: req.user._id,
      cardId: card._id,
    });

    // push it to the card comments
    card.comments.push(newComment._id);

    await newComment.save();
    await card.save();

    res.status(201).send({
      success: true,
      data: {
        _id: newComment._id,
        comment: newComment.comment,
        createdAt: newComment.createdAt,
        isUpdated: newComment.isUpdated,
        user: {
          _id: newComment.user._id,
          username: req.user.username,
          profile: getProfile(req.user.profile),
          isAdmin:
            board.members.find(
              (m: any) =>
                m.memberId.toString() === req.user._id.toString() &&
                m.role === BOARD_MEMBER_ROLES.ADMIN
            ) ||
            board.spaceId.members.find(
              (m: any) =>
                m.memberId.toString() === req.user._id.toString() &&
                m.role === SPACE_MEMBER_ROLES.ADMIN
            )
              ? true
              : false,
        },
      },
      message: "Comment has been added successfully!",
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

// PUT /cards/:id/comments -> update comment
export const updateComment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { comment, commentId } = req.body;

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

    if (!commentId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "commentId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid commentId",
        statusCode: 400,
      });
    }

    if (!comment) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "comment cannot be empty",
        statusCode: 400,
      });
    }

    const card = await Card.findOne({ _id: id })
      .select("_id listId comments")
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
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

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

    // you have the rights to do this
    // now check if comment exists and you are the creator
    if (!card.comments.map((c: any) => c.toString()).includes(commentId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Comment doesn't exists",
        statusCode: 400,
      });
    }

    // find the original comment obj
    const commentObj = await Comment.findOne({ _id: commentId }).select(
      "_id user comment isUpdated"
    );

    // check if you are the creator of the comment
    if (commentObj.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You can't edit someone else's comment",
        statusCode: 403,
      });
    }

    // update the comment
    commentObj.comment = validator.escape(comment);
    commentObj.isUpdated = true;

    await commentObj.save();

    res.send({
      success: true,
      data: {},
      message: "Comment has been updated successfully!",
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

// DELETE /cards/:id/comments -> delete comment
export const deleteComment = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { commentId } = req.body;
    let myRole: string;

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

    if (!commentId) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "commentId is required",
        statusCode: 400,
      });
    } else if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Invalid commentId",
        statusCode: 400,
      });
    }

    const card = await Card.findOne({ _id: id }).select("_id listId comments");

    if (!card) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Card not found",
        statusCode: 404,
      });
    }

    const list = await List.findOne({ _id: card.listId })
      .select("_id boardId")
      .lean();

    // board
    const board = await Board.findOne({ _id: list.boardId })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

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

    if (boardMember) {
      myRole = boardMember.role;
    } else {
      myRole = spaceMember.role;
    }

    // now you may be an ADMIN/NORMAL/OBSERVER
    // NORMAL/OBSERVER can't delete someone else's comment

    // now check if comment exists and you are the creator or you are an ADMIN and the commentator is not an ADMIN
    if (!card.comments.map((c: any) => c.toString()).includes(commentId)) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Comment doesn't exists",
        statusCode: 400,
      });
    }

    // if you are not the commentator, then you should be an ADMIN and the commentator shouldn't be an ADMIN

    // find the original comment obj
    const commentObj = await Comment.findOne({ _id: commentId }).select(
      "_id user comment"
    );

    // if you are the comment creator, then you can delete it
    if (commentObj.user.toString() === req.user._id.toString()) {
      card.comments = card.comments.filter(
        (c: any) => c.toString() !== commentObj._id.toString()
      );

      await card.save();
      await Comment.deleteOne({ _id: commentObj._id });

      return res.send({
        success: true,
        data: {},
        message: "Comment has been deleted successfully",
        statusCode: 200,
      });
    }

    // you are trying to delete someone else's comment
    // if so, you should be an ADMIN and the commentator should be either NORMAL / OBSERVER
    if (myRole !== BOARD_MEMBER_ROLES.ADMIN) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have the permission to perform this action",
        statusCode: 403,
      });
    }

    // if you are an ADMIN, check the commentator's role
    let commentatorRole = null;

    const cBoardMember = board.members.find(
      (m: any) => m.memberId.toString() === commentObj.user.toString()
    );
    const cSpaceMember = board.spaceId.members.find(
      (m: any) => m.memberId.toString() === commentObj.user.toString()
    );

    if (cBoardMember || cSpaceMember) {
      if (cBoardMember) {
        commentatorRole = cBoardMember.role;
      } else {
        commentatorRole = cSpaceMember.role;
      }
    }

    if (commentatorRole && commentatorRole === BOARD_MEMBER_ROLES.ADMIN) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You can't delete other ADMIN's comment",
        statusCode: 403,
      });
    }

    // now you can delete the comment
    card.comments = card.comments.filter(
      (c: any) => c.toString() !== commentObj._id.toString()
    );

    await card.save();
    await Comment.deleteOne({ _id: commentObj._id });

    return res.send({
      success: true,
      data: {},
      message: "Comment has been deleted successfully",
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

// DELETE /cards/:id -> delete card
export const deleteCard = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

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

    const card = await Card.findOne({ _id: id }).select("_id listId comments");

    if (!card) {
      return res.status(404).send({
        success: false,
        data: {},
        message: "Card not found",
        statusCode: 404,
      });
    }

    // corresponding list
    const list = await List.findOne({ _id: card.listId }).select(
      "_id boardId cards"
    );

    // board
    const board = await Board.findOne({ _id: list.boardId })
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

    // check whether the user has the rights to delete the card -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // delete the card
    // remove comment from list
    list.cards = list.cards.filter(
      (c: any) => c.toString() !== card._id.toString()
    );
    await list.save();

    // remove all comments
    await Comment.deleteMany({ _id: { $in: card.comments } });

    // delete the card
    await Card.deleteOne({ _id: card._id });

    res.send({
      success: true,
      data: {},
      message: "Card has been deleted successfully.",
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

// PUT /cards/:id/dueDate -> add/update duedate
export const updateDueDate = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;

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

    if (!dueDate) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "dueDate is required",
        statusCode: 400,
      });
    }
    // dueDate validation here

    const card = await Card.findOne({ _id: id }).select("_id dueDate listId");

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
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

    // check whether the user has the rights to update card dueDate -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // update the dueDate
    card.dueDate = dueDate;

    await card.save();

    res.send({
      success: true,
      data: card.dueDate,
      message: "Card dueDate updated successfully.",
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

// DELETE /cards/:id/dueDate -> remove duedate
export const removeDueDate = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

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

    const card = await Card.findOne({ _id: id }).select(
      "_id dueDate isComplete listId"
    );

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
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

    // check whether the user has the rights to update card dueDate -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // update the dueDate
    if (!card.dueDate) {
      return res.status(400).send({
        success: false,
        data: {},
        message: "Card has no dueDate. First add dueDate.",
        statusCode: 400,
      });
    }

    // unset dueDate
    await Card.updateOne(
      {
        _id: card._id,
      },
      { $unset: { dueDate: "" } }
    );

    card.isComplete = false;
    await card.save();

    res.send({
      success: true,
      data: {},
      message: "Card dueDate removed successfully.",
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

// PUT /cards/:id/isComplete -> update isComplete
export const toggleIsComplete = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

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

    const card = await Card.findOne({ _id: id }).select(
      "_id dueDate isComplete listId"
    );

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
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

    // check whether the user has the rights to update card dueDate -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // check if no dueDate
    if (!card.dueDate) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "First add dueDate inorder to toggle isComplete",
        statusCode: 403,
      });
    }

    // toggle isComplete
    card.isComplete = !card.isComplete;

    await card.save();

    res.send({
      success: true,
      data: {
        isComplete: card.isComplete,
      },
      message: "Card isComplete updated successfully.",
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

// PUT /cards/:id/cover -> add/update card cover
export const updateCardCover = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { coverImg, color } = req.body;

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

    if (!Object.keys(req.body).includes("coverImg")) {
      return res.status(400).send({
        success: false,
        data: {},
        message:
          "coverImg is required, if no image then please provide an empty string as value",
        statusCode: 400,
      });
    } else if (
      coverImg &&
      !validator.isURL(coverImg, {
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

    const card = await Card.findOne({ _id: id }).select(
      "_id coverImg color listId"
    );

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
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

    // check whether the user has the rights to update card dueDate -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    // update the card cover
    card.coverImg = coverImg;
    card.color = color;

    await card.save();

    res.send({
      success: true,
      data: {},
      message: "Card cover updated successfully.",
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

// DELETE /cards/:id/cover -> remove card cover
export const removeCardCover = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

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

    const card = await Card.findOne({ _id: id }).select(
      "_id coverImg color listId"
    );

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
      .select("_id spaceId members visibility")
      .populate({
        path: "spaceId",
        select: "_id name members",
      })
      .lean();

    // check whether the user has the rights to update card dueDate -> ADMIN / NORMAL
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

    // you are either a board member or space member
    if (boardMember && boardMember.role === BOARD_MEMBER_ROLES.OBSERVER) {
      return res.status(403).send({
        success: false,
        data: {},
        message: "You don't have permission to perform this action",
        statusCode: 403,
      });
    }

    if (card.coverImg || card.color) {
      await Card.updateOne(
        {
          _id: card._id,
        },
        { $unset: { coverImg: "", color: "" } }
      );
    }

    res.send({
      success: true,
      data: {},
      message: "Card cover removed successfully.",
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
