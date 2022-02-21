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
    pos: {
      type: String,
      required: true,
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
    coverImg: {
      type: String,
      required: false,
      validate: {
        validator: function (value: string) {
          return value
            ? validator.isURL(value, {
                require_protocol: true,
              })
            : true;
        },
        message: `Invalid Image URL`,
      },
      trim: true,
    },
    color: {
      type: String,
      required: false,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: false,
    },
    isComplete: {
      type: Boolean,
      default: false,
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
    labels: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Label",
          required: true,
        },
      ],
      default: [],
    },
    comments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
          required: true,
        },
      ],
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

const Card = mongoose.model("Card", cardSchema);

export default Card;
