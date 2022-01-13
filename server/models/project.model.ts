import mongoose from "mongoose";
import { PROJECT_MEMBER_ROLES } from "../types/constants";

const projectMemberSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(PROJECT_MEMBER_ROLES),
    default: PROJECT_MEMBER_ROLES.NORMAL,
  },
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
    },
    icon: {
      type: String,
      required: false,
    },
    boards: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Board",
          required: true,
        },
      ],
      default: [],
    },
    members: {
      type: [projectMemberSchema],
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

const Project = mongoose.model("Project", projectSchema);

export default Project;
