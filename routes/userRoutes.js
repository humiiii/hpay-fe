const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  checkUserWallet,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route to register a new user
router.post("/register", registerUser);

// Route to log in a user
router.post("/login", loginUser);

// Route to get user profile (protected)
router.get("/profile", authMiddleware, getUserProfile);

// Route to validate JWT token (protected)
router.get("/validate-token", authMiddleware, (req, res) => {
  res.status(200).json({ message: "Token is valid", isValid: true });
});

// Route to check if the user has a wallet (protected)
router.get("/wallet", authMiddleware, checkUserWallet);

module.exports = router;
