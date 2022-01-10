import { add } from "date-fns";
import mongoose from "mongoose";
import { EMAIL_TOKEN_LENGTH } from "../config";

const emailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    minlength: EMAIL_TOKEN_LENGTH,
    maxlength: EMAIL_TOKEN_LENGTH,
  },
  expiresAt: {
    type: Date,
    default: add(new Date(), {
      minutes: 30,
    }),
  },
});

const EmailVerification = mongoose.model(
  "EmailVerification",
  emailVerificationSchema
);

export default EmailVerification;
