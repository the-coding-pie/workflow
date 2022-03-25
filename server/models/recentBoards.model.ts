import mongoose from "mongoose";

const recentBoardsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
  },
  lastVisited: {
    type: Date,
    default: Date.now,
  },
});

const RecentBoard = mongoose.model("RecentBoard", recentBoardsSchema);

export default RecentBoard;