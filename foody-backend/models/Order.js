const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food"
  },

  // ✅ NEW (for proper complaint linking)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // assuming hotel is also in User model
  },

  foodName: String,
  foodImage: String,
  hotelName: String,

  userPhone: String,
  price: Number,

  address: String,
  paymentMethod: String,

  // 🚀 ORDER STATUS FLOW
  status: {
    type: String,
    enum: [
      "order placed",
      "preparing",
      "picked",
      "on the way",
      "near",
      "delivered"
    ],
    default: "order placed"
  },

  // ✅ NEW – Track actual delivery time
  deliveredAt: {
    type: Date
  },

  // 🛵 RIDER INFO (LEVEL 4)
  riderName: {
    type: String,
    default: "Arjun"
  },

  riderPhone: {
    type: String,
    default: "9876543210"
  },

  bikeNumber: {
    type: String,
    default: "TN 09 AB 1234"
  },

  // ⏱ ETA
  eta: {
    type: Number,
    default: 30
  },

  // ⭐ RATINGS
  deliveryRating: {
    type: Number,
    default: 0
  },

  hotelRating: {
    type: Number,
    default: 0
  },

  deliveryFeedback: {
    type: String,
    default: ""
  },

  hotelFeedback: {
    type: String,
    default: ""
  },

  // ✅ NEW – Prevent duplicate complaints
  complaintSubmitted: {
    type: Boolean,
    default: false
  },

  // 📍 DEMO COORDS (for map animation)
  userLat: Number,
  userLng: Number,

  hotelLat: Number,
  hotelLng: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Order", orderSchema);