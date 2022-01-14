import mongoose from "mongoose";
import validator from "validator";

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 512,
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    cover: {
      type: String,
      required: false,
      validator: function (value: string) {
        return (
          value.startsWith("#", 0) ||
          validator.isURL(value, {
            require_protocol: true,
          })
        );
      },
      message: `Invalid value for cover`,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);

export default Card;
