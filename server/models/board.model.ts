import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 512,
  },
  bgImg: {
    type: String,
    required: false,
  },
  color: {
    type: String,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
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
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    default: [],
  },
});

const Board = mongoose.model("Board", boardSchema);

export default Board;
