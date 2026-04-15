import mongoose from "mongoose";

const StepLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    steps: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
    source: { type: String, default: "manual" }, // manual | googlefit | applehealth
  },
  { timestamps: true }
);
StepLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.StepLog || mongoose.model("StepLog", StepLogSchema);
