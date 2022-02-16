import mongoose from "mongoose";

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          return value.startsWith("#", 0) && value.length === 7;
        },
        message: `Invalid value for color`,
      },
      trim: true,
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
