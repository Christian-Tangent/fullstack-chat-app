import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } //Allows us to track when the user was created and updated
);

const User = mongoose.model("User", userSchema); // Create a model from the schema
// The model is a constructor function that creates new documents in the database

export default User;
