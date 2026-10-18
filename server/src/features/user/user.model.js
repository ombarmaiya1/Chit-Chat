import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("user", UserSchema);

export default User;