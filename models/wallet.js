const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
  },
  { timestamps: true }
);
console.log(walletSchema.indexes());

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
