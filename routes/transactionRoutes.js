const express = require("express");
const TransactionController = require("../controllers/transactionController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

// GET /api/transactions - Get current user's transactions (protected)
router.get("/", authMiddleware, TransactionController.getUserTransactions);

module.exports = router;
