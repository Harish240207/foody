const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""
  },

  // 🔹 Existing Phone Login (kept fully intact)
  phone: {
    type: String,
    required: true,
    unique: true
  },

  // 🟢 Email Login Support
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String
  },

  address: {
    type: String,
    default: ""
  },

  latitude: {
    type: Number,
    default: null
  },

  longitude: {
    type: Number,
    default: null
  },

  role: {
    type: String,
    default: "user"
  },

  role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
},

  // 🚨 NEW – Complaint & Strike System (For Hotels Only)

  strikeCount: {
    type: Number,
    default: 0
  },

  totalComplaints: {
    type: Number,
    default: 0
  },

  isBlocked: {
    type: Boolean,
    default: false
  },

  lastStrikeDate: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);