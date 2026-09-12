const express = require("express");

const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) {
      return res.status(400).json({ message: "wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const newuser = new User({
      name,
      email,
      password: hashedpassword,
      role: "user",
      cart: [],
      orders: [],
    });
    await newuser.save();

    res.json({
      _id: newuser._id,
      name: newuser.name,
      email: newuser.email,
      role: newuser.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getallusers = async (req, res) => {
  try {
    const users = await User.find().select("-password -cart");

    if (users.length === 0) {
      return res.status(400).json({ message: "no users found" });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getuserbyid = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -cart");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteuser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)

    const user = await User.findByIdAndDelete(id);

    if (user.length==0) {
      return res.status(400).json({ message: "user not found" });
    }
    res.json({ message: "user deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rolechanger = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
       

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle role
    user.role = user.role === "admin" ? "user" : "admin";

    await user.save();

    res.json({
      message: "Role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getallusers,
  getuserbyid,
  deleteuser,
  rolechanger
};
