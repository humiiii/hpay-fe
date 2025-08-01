const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // You can optionally add mongoose connection options here (useNewUrlParser, useUnifiedTopology, etc.)
    });

    console.log("MongoDB connected successfully.");

    mongoose.connection.once("open", async () => {
      try {
        // Drop all indexes on 'wallets' collection
        await mongoose.connection.db.collection("wallets").dropIndexes();
        console.log("Dropped existing indexes on 'wallets' collection.");
      } catch (error) {
        // This may happen if there are no indexes or system indexes
        console.warn("Could not drop indexes or no indexes to drop:", error.message);
      }
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
