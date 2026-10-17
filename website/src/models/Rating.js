import mongoose from "mongoose";
// Rating Model
const ratingSchema = new mongoose.Schema(
    {
      laborer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
      score: { type: Number, required: true, min: 1, max: 5 },
      review: { type: String },
    },
    { timestamps: true }
  );
  
 export const Rating = mongoose.model("Rating", ratingSchema);
  

  