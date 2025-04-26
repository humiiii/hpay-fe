const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

//Route to register a new User
router.post("/register", registerUser);

// Route to log in a user
router.post("/login", loginUser);

//Router to get user details
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
