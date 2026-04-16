import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    foodName: String,
    portion: String,
    grams: Number,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fdcId: Number,
    matched: String,
    source: String,
  },
  { _id: false }
);

const FoodLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [ItemSchema],
    totalCalories: Number,
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

FoodLogSchema.index({ userId: 1, loggedAt: -1 });

export default mongoose.models.FoodLog || mongoose.model("FoodLog", FoodLogSchema);
