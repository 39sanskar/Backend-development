import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import ApiError from "../utils/apiError";

config({ path: ".env" });

// --------------------
// Interfaces
// --------------------
export interface IUser extends Document {
  username: string;
  password: string;
  age?: number;
  email: string;
  fullName: string;
  refreshToken?: string;
}

export interface IUserMethods {
  isPasswordMatched(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

// Combine IUser + methods into Mongoose model type
export type UserModel = Model<IUser, {}, IUserMethods>;

// --------------------
// Schema
// --------------------
const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // hide by default
    },
    age: {
      type: Number,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    fullName: {
      type: String,
      required: [true, "Please provide a full name"],
      trim: true,
    },
    refreshToken: {
      type: String,
      select: false, // best practice, hide tokens by default
    },
  },
  { timestamps: true }
);

// --------------------
// Hooks
// --------------------
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// --------------------
// Methods
// --------------------
userSchema.methods.isPasswordMatched = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new ApiError(
      "ACCESS_TOKEN_SECRET is not defined in the environment",
      500
    );
  }

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new ApiError(
      "REFRESH_TOKEN_SECRET is not defined in the environment",
      500
    );
  }

  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d",
    }
  );
};

// --------------------
// Model Export
// --------------------
export const User = mongoose.model<IUser, UserModel>("User", userSchema);
