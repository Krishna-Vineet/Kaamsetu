import mongoose from "mongoose";

// Log Model
const logSchema = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      link: { type: String },
    },
    { timestamps: true }
  );
  
 export const Log = mongoose.model("Log", logSchema);