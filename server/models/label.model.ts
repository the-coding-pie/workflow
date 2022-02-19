import mongoose from "mongoose";
import { LABEL_COLORS } from "../types/constants";

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      maxlength: 512,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return Object.values(LABEL_COLORS).includes(value);
        },
        message: `Invalid value for color`,
      },
      trim: true,
    },
    pos: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
  },
  { timestamps: true }
);

const Label = mongoose.model("Label", labelSchema);

export default Label;
