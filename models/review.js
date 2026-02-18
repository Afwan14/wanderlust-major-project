// ============================================
// REVIEW MODEL
// Stores per-category ratings + overall
// ============================================

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
    },

    overall: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    cleanliness: { type: Number, min: 1, max: 5, required: true },
    accuracy: { type: Number, min: 1, max: 5, required: true },
    checkIn: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    location: { type: Number, min: 1, max: 5, required: true },
    value: { type: Number, min: 1, max: 5, required: true },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
