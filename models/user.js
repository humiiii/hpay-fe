const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // trims whitespace from ends
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // store emails in lowercase for consistency
      trim: true,
      match: [/.+@.+\..+/, "Please fill a valid email address"], // basic email format validation
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // enforce a minimum password length
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
