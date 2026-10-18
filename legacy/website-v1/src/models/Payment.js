import mongoose from "mongoose";

// Payment Model
const paymentSchema = new mongoose.Schema(
    {
      job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
      client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      laborer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      amount: { type: Number, required: true },
      transactionId: { type: String, unique: true },
      status: { type: String, required: true, enum: ["pending", "completed", "cancelled"] },
      dueDate: { type: Date },
      doneDate: { type: Date },
    },
    { timestamps: true }
  );
  
 export const Payment = mongoose.model("Payment", paymentSchema);