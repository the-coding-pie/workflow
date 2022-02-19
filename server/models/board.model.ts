import mongoose from "mongoose";
import validator from "validator";
import { BOARD_MEMBER_ROLES, BOARD_VISIBILITY } from "../types/constants";

const boardMemberSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(BOARD_MEMBER_ROLES),
      default: BOARD_MEMBER_ROLES.NORMAL,
    },
    fallbackRole: {
      type: String,
      enum: [...Object.values(BOARD_MEMBER_ROLES)],
      required: false,
    },
  },
  { _id: false, timestamps: true }
);

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 512,
      trim: true,
    },
    visibility: {
      type: String,
      enum: Object.values(BOARD_VISIBILITY),
      default: BOARD_VISIBILITY.PUBLIC,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    labels: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Label",
          required: true,
        },
      ],
      default: [],
    },
    bgImg: {
      type: String,
      required: false,
      validate: {
        validator: function (value: string) {
          return value
            ? validator.isURL(value, {
                require_protocol: true,
              })
            : true;
        },
        message: `Invalid Image URL`,
      },
      trim: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
    },
    lists: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "List",
          required: true,
        },
      ],
      default: [],
    },
    members: {
      type: [boardMemberSchema],
      default: [],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Board = mongoose.model("Board", boardSchema);

export default Board;
