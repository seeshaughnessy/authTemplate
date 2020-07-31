const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");
const { findOne } = require("../models/User");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/register", async (req, res) => {
  try {
    const { email, password, passwordCheck } = req.body;
    let fullName = req.body.fullName;

    // Validation

    // if email/password/passwordCheck are blank
    if (!email || !password || !passwordCheck) {
      return res.status(400).json({ msg: "Please complete all fields" });
    }
    // if password matches password check
    if (password !== passwordCheck) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }
    // if password is more than 5 characters
    if (password.length < 5) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 5 characters" });
    }
    // if email is unique
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: "User with the email already exists" });
    }
    // set fullName if nothing is provided
    if (!fullName) {
      fullName = email.split("@")[0];
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const savedUser = new UserModel({
      email,
      password: passwordHash,
      fullName
    });
    await savedUser.save();
    res.status(200).json("user saved");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation
    // if field is left blank
    if (!email || !password) {
      return res.status(400).json({ msg: "Please complete all fields" });
    }
    // if email is found in database
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "No user exists, please register" });
    }
    // if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Password is incorrect" });
    }
    // sign jwt
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: { id: user._id, fullName: user.fullName }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", auth, async (req, res) => {
  try {
    // Delete user from database and return deleted user via json
    const deletedUser = await UserModel.findByIdAndDelete(req.userId);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// returns true or false if user is authorized
router.post("/isAuthorized", async (req, res) => {
  try {
    // Validation
    // if there is a token
    const token = req.header("x-auth-token");
    if (!token) return res.status(200).json(false);
    // if token is verified via jwt (returns {id, iat})
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) return res.status(200).json(false);
    // if user is found in database
    const user = await UserModel.findOne({ _id: verified.id });
    if (!user) return res.status(200).json(false);
    // if no errors, return true
    return res.status(200).json(true);
  } catch (err) {
    res.status(200).json(false);
  }
});

// gets user data for logged in user
router.get("/", auth, async (req, res) => {
  const user = await UserModel.findById({ _id: req.userId });
  res.json({
    fullName: user.fullName,
    id: user._id
  });
});

module.exports = router;
