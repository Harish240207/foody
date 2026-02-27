const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userPhone: {
    type: String,
    required: true
  },
  items: [
    {
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
      },
      qty: {
        type: Number,
        default: 1
      }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Cart", cartSchema);