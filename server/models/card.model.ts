import mongoose from "mongoose";
import validator from "validator";

const cardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 512,
      trim: true,
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    cover: {
      type: String,
      required: false,
      validate: {
        validator: function (value: string) {
          return (
            (value.startsWith("#", 0) && value.length === 7) ||
            validator.isURL(value, {
              require_protocol: true,
            })
          );
        },
        message: `Invalid value for cover`,
      },
      trim: true,
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
