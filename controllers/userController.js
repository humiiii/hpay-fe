const User = require("../models/user");
const Wallet = require("../models/wallet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Validate user creation
    if (!user._id) {
      return res
        .status(500)
        .json({ message: "User ID missing, check database connections" });
    }

    // Generate token
    const token = generateToken(user._id);

    // To avoid sending password back
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error("Register user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// User profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Check if user has a wallet
const checkUserWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wallet");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.wallet) {
      return res.status(200).json({
        user: { _id: user._id, name: user.name, email: user.email }, // minimal user info, no password
        hasWallet: false,
        message: "No wallet associated with this user",
      });
    }

    return res.status(200).json({
      hasWallet: true,
      wallet: user.wallet,
    });
  } catch (error) {
    console.error("Error checking wallet:", error);
    return res.status(500).json({
      message: "Server error while checking wallet",
      error: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, checkUserWallet };
