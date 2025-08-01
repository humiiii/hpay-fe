const express = require("express");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const userController = require("../controllers/userController");

const router = express.Router();

const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

router.post("/register", validateRegister, asyncHandler(userController.registerUser));
router.post("/login", validateLogin, asyncHandler(userController.loginUser));

module.exports = router;
