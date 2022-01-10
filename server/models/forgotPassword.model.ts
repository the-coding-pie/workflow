import mongoose from "mongoose";
import { add } from "date-fns";
import { FORGOT_PASSWORD_TOKEN_LENGTH } from "../config";

const forgotPasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    minlength: FORGOT_PASSWORD_TOKEN_LENGTH,
    maxlength: FORGOT_PASSWORD_TOKEN_LENGTH,
  },
  expiresAt: {
    type: Date,
    default: add(new Date(), {
      days: 3,
    }),
  },
});

const ForgotPassword = mongoose.model("ForgotPassword", forgotPasswordSchema);

export default ForgotPassword;
