// User Model
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: undefined },
    phone: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ["admin", "client", "labor"] },
    skills: { type: [String], default: undefined },
    address: { type: String, trim: true },
    pin: { type: Number },
    upiId: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);