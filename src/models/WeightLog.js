import mongoose from "mongoose";

const WeightLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weightKg: { type: Number, required: true },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);
WeightLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.WeightLog || mongoose.model("WeightLog", WeightLogSchema);
