import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const saltRounds = 10;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 2,
      validate: {
        validator: function (value: string) {
          return /^[A-Za-z0-9_-]*$/.test(value);
        },
        message:
          "Username must only contain letters, numbers, underscores and dashes",
      },
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value: string) {
          return validator.isEmail(value);
        },
        message: "Invalid email",
      },
      trim: true,
    },
    profile: {
      type: String,
      default: "default.jpg",
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    isOAuth: {
      type: Boolean,
      default: false,
      required: true,
    },
    password: {
      type: String,
      required: function (): boolean {
        return !this.isOAuth;
      },
      minlength: 8,
      validate: {
        validator: function (value: string) {
          if (!/\d/.test(value) || !/[a-zA-Z]/.test(value)) {
            return false;
          }
        },
        message: "Password must contain at least one letter and one number",
      },
      trim: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// middlewares
userSchema.pre("save", async function (next) {
  // if password modified, hash it
  if (this.isModified("password")) {
    // else hash
    const salt = await bcrypt.genSalt(saltRounds);
    (this as any).password = await bcrypt.hash((this as any).password, salt);
  }

  next();
});

// methods
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
