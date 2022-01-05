import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const saltRounds = 10;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
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
    },
    password: {
      type: String,
      required: true,
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
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// methods
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
