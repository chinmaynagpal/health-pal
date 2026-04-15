import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    heightCm: Number,
    weightKg: Number,
    whatsappNumber: String, // E.164, e.g. +15551234567
    goals: {
      dailyCalories: { type: Number, default: 2000 },
      dailySteps: { type: Number, default: 10000 },
      targetWeightKg: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
