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

  // 🟢 NEW — Email Login Support (optional)
  email: {
    type: String,
    unique: true,
    sparse: true,   // allows multiple null values (important!)
    lowercase: true,
    trim: true
  },

  // 🟢 NEW — Password (only for email users)
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

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);