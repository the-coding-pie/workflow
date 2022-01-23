import mongoose from "mongoose";
import { SPACE_MEMBER_ROLES } from "../types/constants";

const spaceMemberSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(SPACE_MEMBER_ROLES),
      default: SPACE_MEMBER_ROLES.NORMAL,
    },
  },
  { _id: false, timestamps: true }
);

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      maxlength: 255,
      trim: true,
    },
    icon: {
      type: String,
      required: false,
      trim: true,
    },
    boards: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Board",
          required: true,
        },
      ],
      default: [],
    },
    members: {
      type: [spaceMemberSchema],
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

const Space = mongoose.model("Space", spaceSchema);

export default Space;
