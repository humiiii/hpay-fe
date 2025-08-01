const Wallet = require("../models/wallet");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Create Wallet - Assumes req.user is available via auth middleware
const createWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const existingWallet = await Wallet.findOne({ userId }).lean();
    if (existingWallet) {
      return res.status(400).json({ message: "Wallet already exists" });
    }

    const newWallet = new Wallet({ userId, balance: 0 });
    await newWallet.save();

    await User.findByIdAndUpdate(userId, { wallet: newWallet._id });

    res.status(201).json({ message: "Wallet created successfully", wallet: newWallet });
  } catch (error) {
    console.error("Create wallet error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const wallet = await Wallet.findOne({ userId }).lean();
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json({ balance: wallet.balance });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const depositMoney = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit details" });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: "deposit",
      amount,
      balance: wallet.balance,
    });

    res.status(200).json({ message: "Deposit successful", balance: wallet.balance });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const withdrawMoney = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal details" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(403).json({ message: "Insufficient balance" });
    }

    wallet.balance -= amount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: "withdraw",
      amount,
      balance: wallet.balance,
    });

    res.json({ message: "Withdrawal successful", balance: wallet.balance });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const transferFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { senderId, receiverId, amount } = req.body;
    if (!senderId || !receiverId || typeof amount !== "number" || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid transfer details" });
    }

    if (senderId === receiverId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Sender and receiver cannot be the same" });
    }

    const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
    const receiverWallet = await Wallet.findOne({ userId: receiverId }).session(session);

    if (!senderWallet || !receiverWallet) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "One or both users do not have wallets" });
    }

    if (senderWallet.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    await Transaction.create(
      [
        {
          userId: senderId,
          type: "transfer",
          amount,
          senderId,
          receiverId,
          balance: senderWallet.balance,
        },
        {
          userId: receiverId,
          type: "receive",
          amount,
          senderId,
          receiverId,
          balance: receiverWallet.balance,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Transfer successful",
      senderBalance: senderWallet.balance,
      receiverBalance: receiverWallet.balance,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transfer error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTransaction = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const transactions = await Transaction.find({
      $or: [{ userId }, { senderId: userId }, { receiverId: userId }],
    })
      .sort({ timestamp: -1 })
      .lean();

    res.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createWallet,
  getWallet,
  depositMoney,
  withdrawMoney,
  transferFunds,
  getTransaction,
};
