const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  // 🔹 Link food to specific hotel
  hotelId: {
    type: String,
    required: true
  },

  hotelName: {
    type: String,
    required: true
  },

  foodName: {
    type: String,
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  // 🔥 Store original quantity for NGO logic
  originalQuantity: {
    type: Number,
    required: true
  },

  originalPrice: {
    type: Number,
    required: true
  },

  discountPrice: {
    type: Number,
    required: true
  },

  // ⏳ Expiry tracking
  expiryTime: {
    type: Date,
    required: true
  },

  // 🛑 NGO TRANSFER FLAGS
  isTransferredToNGO: {
    type: Boolean,
    default: false
  },

  ngoTransferredQty: {
    type: Number,
    default: 0
  },

  ngoPickupStatus: {
    type: String,
    enum: ["pending", "notified", "collected"],
    default: "pending"
  },

  location: String,
  image: String,

  category: {
    type: String,
    enum: ["veg", "nonveg"],
    default: "veg"
  },

  ratings: [
    {
      userPhone: String,
      rating: Number,
      review: String
    }
  ],

  avgRating: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Food", foodSchema);