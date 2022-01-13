import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 512,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
    required: true,
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
});

const List = mongoose.model("List", listSchema);

export default List;
