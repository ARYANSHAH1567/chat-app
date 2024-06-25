const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");


const newUser = async (req, res) => {
  res.render("signupForm");
};

const registerUser = async (req, res, next) => {
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


const loginForm = async (req, res) => {
  res.render("login");
};

const authUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });

      if (!user) {
          const err = new Error('Invalid email or password');
          err.status = 401; 
          throw err;
      }


      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
          const err = new Error('Invalid email or password');
          err.status = 401;
          throw err;
      }

      // Generate JWT token
      const token = generateToken(user._id);
      res.cookie('token', token, {
          httpOnly: true,
      });
      res.status(200).json({ message: 'User logged in successfully' });

  } catch (err) {
      next(err);
  }
};



const logout = (req, res) => {

  res.clearCookie("token");
  res.redirect("/"); 
};

module.exports = { registerUser, authUser, newUser, loginForm, logout };
