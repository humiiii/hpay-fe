const Transaction = require("../models/transaction");

exports.createTransaction = async (userId, type,amount, senderId = null, receiverId = null) => {
    try{
        const transaction = new Transaction({
            userId,
            type,
            amount,
            senderId,
            receiverId,
        });
        await transaction.save();
        console.log("Transaction saved:", transaction);
    } catch (error) {
        console.error("Transaction creation  failed :", error);
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
const userId = req.user.id;

const transaction = await Transaction.find({
    $or: [{ senderId: userId}, {receiverId: userId},{userId:userId}]
}).sort({ timestamp: -1});
res.json({ transaction});
    } catch (error) {
        res.status(500).json({message: "Server error", error});
    }
};