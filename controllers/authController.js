const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const newUser = async (req, res) => {
  res.render("signupForm");
};

const registerUser = async (req, res, next) => {
  console.log(req.headers);
  console.log(req.body);
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
   let err =  new Error("User already exists");
   next(err);
  }
  if (!password) {
    throw new Error("Password is required");

  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });
  if (user) {
    res.status(201).json({ message: 'User registered successfully' });
  } else {
    res.status(400);
    let err =   new Error("Invalid user data");
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginForm = async (req, res) => {
  res.render("login");
};

const authUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });

      if (!user) {
          // User not found with the given email
          const err = new Error('Invalid email or password');
          err.status = 401; // Unauthorized
          throw err;
      }

      // Validate password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          // Incorrect password
          const err = new Error('Invalid email or password');
          err.status = 401; // Unauthorized
          throw err;
      }

      // Generate JWT token
      const token = generateToken(user._id); // Assuming generateToken generates a token based on user ID
      res.cookie('token', token, {
          httpOnly: true,
          // secure: true, // Enable in production if using HTTPS
      });
      res.status(200).json({ message: 'User logged in successfully' });

  } catch (err) {
      // Pass the error to the next middleware (error handler)
      next(err);
  }
};

// routes/auth.js or wherever your auth routes are defined
const express = require("express");
const router = express.Router();

const logout = (req, res) => {
  // Clear the token cookie
  res.clearCookie("token");
  res.redirect("/"); // Redirect to login page after logout
};

module.exports = { registerUser, authUser, newUser, loginForm, logout };
