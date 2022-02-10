import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 512,
      trim: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    pos: {
      type: String,
      required: true,
      trim: true,
    },
    cards: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Card",
          required: true,
        },
      ],
      default: [],
    },
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const List = mongoose.model("List", listSchema);

export default List;
