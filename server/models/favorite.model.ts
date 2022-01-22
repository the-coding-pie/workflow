import mongoose from "mongoose";
import { BOARD, SPACE } from "../types/constants";

const favoriteSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: [BOARD, SPACE],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
