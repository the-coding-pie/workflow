import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 512,
  },
  description: {
    type: String,
    required: false,
  },
  cover: {
    type: String,
    required: false,
  },
});

const Card = mongoose.model("Card", cardSchema);

export default Card;