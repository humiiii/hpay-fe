const express =require("express");
const TransactionController =require ("../controllers/TransactionController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/",authMiddleware, TransactionController.getUserTransactions);

module.exports = router;