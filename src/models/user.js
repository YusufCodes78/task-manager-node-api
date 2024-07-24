import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Task from "./task.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
  },
  age: {
    type: Number,
    default: 0,
  },
  avatar:{
    type: Buffer,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// To get all the tasks of the user virtually, not stored in the database
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// To send only specific values of the user
userSchema.methods.toJSON = function () {
  const user = this;
  const userJson = user.toObject();
  delete userJson.password;
  delete userJson.tokens;
  delete userJson.avatar;
  return userJson;
};

// To generate authentication token everytime user signs up or logs in
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// This function runs everytime a user is saved, and works as a middleware
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcryptjs.hash(user.password, 8);
  }
  next();
});

// This function runs everytime a user is deleted, and works as a middleware
userSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
  console.log("in deleteOne pre");
  const userFilter = this.getQuery();
  await Task.deleteMany({ owner: userFilter._id });
  next();
});

// This function runs everytime for a request to get user or anything related to it
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Unable to login");
  }
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to login");
  }
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
