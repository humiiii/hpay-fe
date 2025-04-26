const express = require ("express");
const walletController = require("../controllers/walletController");

const router = express.Router();

router.post("/create", walletController.createWallet);
router.get("/:userId", walletController.getWallet);
router.post("/deposit", walletController.depositMoney);
router.post("/withdraw", walletController.withdrawMoney);
router.post("/transfer", walletController.transferFunds);
router.get("/transaction/:userId", walletController.getTransaction);

module.exports= router;
