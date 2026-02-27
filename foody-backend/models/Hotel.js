const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({

  // 🔹 Existing Phone Login (kept intact)
  phone: {
    type: String,
    required: true,
    unique: true
  },

  // 🟢 NEW — Email Login Support (optional)
  email: {
    type: String,
    unique: true,
    sparse: true,   // allows multiple null values safely
    lowercase: true,
    trim: true
  },

  // 🟢 NEW — Password (only required for email login)
  password: {
    type: String
  },

  hotelName: String,
  location: String,
  latitude: Number,
  longitude: Number,
  image: String,

  // ⭐ RATINGS
  avgRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },

  // 🛡 NATIONAL SAFETY SYSTEM
  verifiedBadge: {
    type: String,
    enum: ["unverified", "verified", "trusted", "suspended"],
    default: "verified"
  },

  hygieneRating: { type: Number, default: 5 },
  complaintCount: { type: Number, default: 0 },
  strikeCount: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0 },

  // 📊 NATIONAL DATA
  totalOrders: { type: Number, default: 0 },
  lastComplaintAt: Date,
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Hotel", hotelSchema);