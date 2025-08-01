const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createWallet,
  getWallet,
  depositMoney,
  withdrawMoney,
  transferFunds,
  getTransaction,
} = require("../controllers/walletController");

const router = express.Router();

// Apply auth middleware to all wallet routes:
router.use(authMiddleware);

router.post("/create", createWallet);
router.get("/:userId", getWallet);
router.post("/deposit", depositMoney);
router.post("/withdraw", withdrawMoney);
router.post("/transfer", transferFunds);
router.get("/transaction/:userId", getTransaction);

module.exports = router;
