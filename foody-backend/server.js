const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const authRoutes = require("./routes/auth");
const Food = require("./models/Food");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json());

/* ===============================
   CREATE UPLOADS FOLDER IF MISSING
================================ */
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 uploads folder created");
}

app.use("/uploads", express.static("uploads"));

/* ===============================
   ROOT TEST
================================ */
app.get("/", (req, res) => {
  res.send("Foody backend running 🍱");
});

/* ===============================
   DATABASE CONNECT (MONGODB ATLAS)
   🔴 REPLACE PASSWORD BELOW
================================ */
mongoose.connect(
  "mongodb+srv://kharishnandu24_db_user:kUK6AmtSVvFLXPnL@cluster0.9l1qdx1.mongodb.net/foody?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB Atlas Connected ✅"))
.catch(err => console.log("MongoDB Error ❌", err));

/* ===============================
   ROUTES
================================ */
app.use("/api", authRoutes);

/* ===============================
   AUTO RELEASE EXPIRED RESERVATIONS
================================ */
setInterval(async () => {
  try {
    const now = new Date();

    const result = await Food.updateMany(
      {
        isReserved: true,
        reservedUntil: { $lt: now }
      },
      {
        $set: {
          isReserved: false,
          reservedUntil: null,
          reservedBy: null
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log("⏰ Expired reservations released");
    }

  } catch (err) {
    console.log("Reservation release error:", err.message);
  }
}, 60000);

/* ===============================
   AUTO ORDER STATUS FLOW
================================ */
setInterval(async () => {
  try {

    const placed = await Order.find({ status: "order placed" });
    for (let o of placed) {
      o.status = "preparing";
      await o.save();
    }

    const preparing = await Order.find({ status: "preparing" });
    for (let o of preparing) {
      o.status = "on the way";
      await o.save();
    }

    const onWay = await Order.find({ status: "on the way" });
    for (let o of onWay) {
      o.status = "delivered";
      await o.save();
    }

  } catch (err) {
    console.log("Order status auto update error:", err.message);
  }
}, 30000);

/* ===============================
   START SERVER
================================ */
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});