const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "transfer"],
      required: true,
    },
    amount: { type: Number, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    balance: { type: Number, default: null }, // optional snapshot of wallet balance at transaction time
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for better query performance on frequent query fields
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ senderId: 1, timestamp: -1 });
transactionSchema.index({ receiverId: 1, timestamp: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
