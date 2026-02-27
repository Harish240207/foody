const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  foodId: String,
  foodName: String,
  hotelName: String,
  quantity: Number,
  status: {
    type: String,
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Donation", donationSchema);