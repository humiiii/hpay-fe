const Transaction = require("../models/transaction");

exports.createTransaction = async (userId, type, amount, senderId = null, receiverId = null) => {
  try {
    const transaction = new Transaction({
      userId,
      type,
      amount,
      senderId,
      receiverId,
    });

    await transaction.save();
    console.log("Transaction saved:", transaction);
    return transaction; // optionally return saved doc
  } catch (error) {
    console.error("Transaction creation failed:", error);
    // Optionally re-throw if you want caller to handle the error
    // throw error;
  }
};
