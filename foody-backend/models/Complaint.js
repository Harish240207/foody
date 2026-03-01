const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  orderId: String,
  hotelName: String,
  userPhone: String,

  reason: String,
  severity: String,

  proofImage: String,

  status: {
    type: String,
    enum: ["open", "resolved"],
    default: "open"
  },
  resolvedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
});

module.exports = mongoose.model("Complaint", complaintSchema);