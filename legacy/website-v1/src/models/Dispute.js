import mongoose from "mongoose";

// Dispute Model
const disputeSchema = new mongoose.Schema(
    {
      job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
      client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      labor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      description: { type: String, required: true },
      status: { type: String, required: true, enum: ["open", "resolved"] },
    },
    { timestamps: true }
  );
  
 export const Dispute = mongoose.model("Dispute", disputeSchema);