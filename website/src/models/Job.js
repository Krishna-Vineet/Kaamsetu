import mongoose from "mongoose";

// Job Model
const jobSchema = new mongoose.Schema(
    {
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      location: { type: String, required: true, trim: true },
      category: { type: String, required: true },
      subCategory: { type: String },
      media: [{
        url: String,
        public_id: String,
        resource_type: String
      }],
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      budget: { type: Number, required: true },
      cost: { type: Number },
      client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      applied: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
      laborers: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
      status: {
        type: String,
        enum: ["posted", "active", "completed", "cancelled"]
      },
      cancelationReason: { type: String },
      updates: [
        {
          title: { type: String },
          text: { type: String },
          timeStamp: { type: Date, default: Date.now },
        },
      ],
    },
    { timestamps: true }
  );
  
  export const Job = mongoose.model("Job", jobSchema);