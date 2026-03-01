const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const Food = require("../models/Food");
const Order = require("../models/Order");
const User = require("../models/User");
const Hotel = require("../models/Hotel");
const Cart = require("../models/Cart");
const bcrypt = require("bcrypt");
const Complaint = require("../models/Complaint");

// ================= IMAGE UPLOAD =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });


// =========================================================
// 🔒 NATIONAL MODEL — SECURE REPORT SYSTEM (UPGRADED)
// =========================================================
router.post("/report-issue", upload.single("proof"), async (req, res) => {
  try {
    const { orderId, reason, severity } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({
        message: "You can report only after delivery"
      });
    }

    if (order.complaintSubmitted) {
      return res.status(400).json({
        message: "Complaint already submitted for this order"
      });
    }

    const now = new Date();
    const deliveredTime = order.deliveredAt || order.createdAt;
    const diffHours =
      (now - new Date(deliveredTime)) / (1000 * 60 * 60);

    if (diffHours > 24) {
      return res.status(400).json({
        message: "Complaint window closed (24 hours exceeded)"
      });
    }

    const hotel = await Hotel.findOne({ hotelName: order.hotelName });
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // ===============================
    // 🚨 SAVE COMPLAINT (NEW LOGIC)
    // ===============================
    await Complaint.create({
      orderId: order._id,
      hotelName: hotel.hotelName,
      userPhone: order.userPhone,
      reason,
      severity,
      proofImage: req.file ? req.file.filename : null
    });

    // ===============================
    // EXISTING STRIKE LOGIC (UNCHANGED)
    // ===============================

    hotel.complaintCount = (hotel.complaintCount || 0) + 1;

    if (severity === "high" || reason === "Spoiled Food") {
      hotel.strikeCount = (hotel.strikeCount || 0) + 1;
      hotel.riskScore = (hotel.riskScore || 0) + 20;
    } else {
      hotel.riskScore = (hotel.riskScore || 0) + 10;
    }

    hotel.lastComplaintAt = new Date();

    if ((hotel.strikeCount || 0) >= 3) {
      hotel.verifiedBadge = "suspended";
      hotel.isSuspended = true;
    }

    await hotel.save();

    order.complaintSubmitted = true;
    await order.save();

    res.json({
      message: "Complaint submitted successfully",
      proof: req.file ? req.file.filename : null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= USER LOGIN =================
router.post("/user-login", async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    let user = null;

    // 🔹 Login using phone (old system)
    if (phone) {
      user = await User.findOne({ phone });
    }

    // 🔹 Login using email + password (new system)
    if (email && password) {
      user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const match = await bcrypt.compare(password, user.password || "");
      if (!match) {
        return res.status(400).json({ message: "Invalid password" });
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= USER SIGNUP =================
router.post("/user-signup", async (req, res) => {
  try {
    const { name, phone, email, password, address, lat, lng } = req.body;

    if (!name || (!phone && !email)) {
      return res.status(400).json({ message: "Name and phone or email required" });
    }

    // Check if phone exists
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone already registered" });
      }
    }

    // Check if email exists
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = new User({
      name,
      phone: phone || null,
      email: email || null,
      password: hashedPassword,
      address: address || "",
      latitude: lat ? Number(lat) : null,
      longitude: lng ? Number(lng) : null
    });

    await newUser.save();
    res.json(newUser);

  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});


// ================= HOTEL LOGIN =================
router.post("/hotel-login", upload.single("image"), async (req, res) => {
  try {
    const { phone, email, password, hotelName, location, lat, lng } = req.body;

    let hotel = null;

    // 🔹 PHONE LOGIN (existing system)
    if (phone && !email) {
      hotel = await Hotel.findOne({ phone });

      if (!hotel) {
        hotel = new Hotel({
  phone,
  hotelName: hotelName || "Unnamed Hotel",
  location,
  latitude: lat ? Number(lat) : null,
  longitude: lng ? Number(lng) : null,
  image: req.file?.filename || null,
  joinedAt: new Date()
});

        await hotel.save();
      }

      return res.json(hotel);
    }

    // 🔹 EMAIL LOGIN
    if (email && password) {
      hotel = await Hotel.findOne({ email });

      if (!hotel) {
        const hashedPassword = await bcrypt.hash(password, 10);

        hotel = new Hotel({
          phone,
          email,
          password: hashedPassword,
          hotelName: hotelName || "Unnamed Hotel",
          location,
          latitude: lat ? Number(lat) : null,
          longitude: lng ? Number(lng) : null,
          image: req.file?.filename || null,
          joinedAt: new Date()
        });

        await hotel.save();
      } else {
        const match = await bcrypt.compare(password, hotel.password || "");
        if (!match) {
          return res.status(400).json({ message: "Invalid password" });
        }
      }

      return res.json(hotel);
    }

    res.status(400).json({ message: "Login details required" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET HOTELS =================
router.get("/hotels", async (req, res) => {
  try {
    const hotels = await Hotel.find({
      isSuspended: { $ne: true }
    }).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ADD FOOD =================
router.post("/add-food", upload.single("image"), async (req, res) => {
  try {
    const {
      hotelId,
      hotelName,
      foodName,
      quantity,
      originalPrice,
      discountPrice,
      expiryTime,
      location,
      category
    } = req.body;

    if (!hotelId) {
      return res.status(400).json({ message: "hotelId is required" });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const newFood = new Food({
      hotelId: hotel._id.toString(),
      hotelName: hotel.hotelName,
      foodName,
      quantity,
      originalQuantity: quantity, // ⭐ IMPORTANT
      originalPrice,
      discountPrice,
      expiryTime,
      location,
      category,
      image: req.file ? req.file.filename : null,
      createdAt: new Date()
    });

    await newFood.save();
    res.json(newFood);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET FOODS =================
router.get("/foods", async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= FOODS BY HOTEL (BY ID) =================
router.get("/foods-by-hotel/:hotelId", async (req, res) => {
  try {

    const now = new Date();

    const foods = await Food.find({
      hotelId: req.params.hotelId,
      expiryTime: { $gt: now },   // ✅ only non-expired
      quantity: { $gt: 0 }       // ✅ only available
    }).sort({ createdAt: -1 });

    res.json(foods);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ORDER =================
router.post("/order", async (req, res) => {
  try {
    const { foodId, userPhone, address, payment, mode } = req.body;

    const food = await Food.findById(foodId);

    // Increase total orders count
const hotelForStats = await Hotel.findOne({ hotelName: food.hotelName });
if (hotelForStats) {
  hotelForStats.totalOrders += 1;

  // AUTO TRUST PROMOTION
  if (
    hotelForStats.avgRating >= 4.5 &&
    hotelForStats.complaintCount === 0 &&
    hotelForStats.totalOrders >= 20
  ) {
    hotelForStats.verifiedBadge = "trusted";
  }

  await hotelForStats.save();
}

    // BLOCK SUSPENDED HOTEL
    const hotelCheck = await Hotel.findOne({ hotelName: food.hotelName });

    if (hotelCheck?.isSuspended) {
      return res.status(403).json({
        message: "Hotel suspended due to complaints"
      });
    }


    if (!food) return res.status(404).json({ message: "Food not found" });

    // 🚫 BLOCK EXPIRED FOOD
    if (new Date() > new Date(food.expiryTime)) {
      return res.status(400).json({
        message: "Food expired. Cannot order."
      });
    }

    if (food.quantity <= 0) return res.status(400).json({ message: "Sold out" });

    // reduce quantity
    food.quantity -= 1;
    if (food.quantity < 0) food.quantity = 0;
    await food.save();

    // get user location if exists
    const user = await User.findOne({ phone: userPhone });

    const userLat = user?.latitude || 13.0827;
    const userLng = user?.longitude || 80.2707;

    const hotelLat = userLat + 0.01;
    const hotelLng = userLng + 0.01;

    // create order with LEVEL 4 fields
    const order = new Order({
      foodId: food._id,
      foodName: food.foodName,
      foodImage: food.image,
      hotelName: food.hotelName,
      userPhone,
      price: food.discountPrice,
      address: mode === "pickup" ? "Self Pickup" : address,
      paymentMethod: payment,
      mode: mode || "delivery",
      status: "order placed",

      riderName: "Arjun",
      riderPhone: "9876543210",
      bikeNumber: "TN 09 AB 1234",
      eta: 30,

      userLat,
      userLng,
      hotelLat,
      hotelLng,

      createdAt: new Date()
    });

    await order.save();

    simulateOrderFlow(order._id);

    // remove from cart
    const cart = await Cart.findOne({ userPhone });
    if (cart) {
      cart.items = cart.items.filter(
        item => item.foodId.toString() !== foodId
      );
      await cart.save();
    }

    res.json(order);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= USER ORDERS =================
router.get("/my-orders/:phone", async (req, res) => {
  try {
    const orders = await Order.find({
      userPhone: req.params.phone
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ADD REVIEW (SECURE) =================
router.post("/add-review", async (req, res) => {
  try {
    const { foodId, userPhone, rating, review } = req.body;

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ message: "Food not found" });

    // CHECK USER ORDERED
    const ordered = await Order.findOne({
      foodId,
      userPhone,
      status: "delivered"
    });

    if (!ordered) {
      return res.status(403).json({
        message: "You must order this item to review"
      });
    }

    // PREVENT MULTIPLE REVIEWS
    const already = food.ratings.find(r => r.userPhone === userPhone);
    if (already) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    // SAVE FOOD REVIEW
    food.ratings.push({ userPhone, rating, review });

    const total = food.ratings.reduce((sum, r) => sum + r.rating, 0);
    food.avgRating = total / food.ratings.length;

    await food.save();

    // =========================================
    // UPDATE HOTEL RATING
    // =========================================
    const foods = await Food.find({ hotelName: food.hotelName });

    let sum = 0;
    let count = 0;

    foods.forEach(f => {
      if (f.avgRating > 0) {
        sum += f.avgRating;
        count++;
      }
    });

    const hotel = await Hotel.findOne({ hotelName: food.hotelName });

    if (hotel) {
      hotel.avgRating = count ? sum / count : 0;
      hotel.totalReviews = count;

      // =========================================
      // 🧠 NATIONAL TRUST ENGINE
      // =========================================

      // ⭐ GOOD REVIEW → reduce risk
      if (rating >= 4) {
        hotel.riskScore = Math.max(0, (hotel.riskScore || 0) - 5);
      }

      // ⭐ TRUST PROMOTION
      if (
        hotel.avgRating >= 4.5 &&
        (hotel.complaintCount || 0) === 0 &&
        (hotel.totalOrders || 0) >= 20
      ) {
        hotel.verifiedBadge = "trusted";
      }

      // ⚠ IF LOW RATING → increase risk
      if (rating <= 2) {
        hotel.riskScore = (hotel.riskScore || 0) + 10;
      }

      // 🚫 AUTO SUSPEND
      if ((hotel.complaintCount || 0) >= 5) {
        hotel.verifiedBadge = "suspended";
      }

      await hotel.save();
    }

    res.json({ message: "Review added" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET PLACE FROM LAT LNG =================
router.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    const fetch = (...args) =>
      import("node-fetch").then(({default: fetch}) => fetch(...args));

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "foody-app"
        }
      }
    );

    const data = await response.json();

    const area =
      data?.address?.suburb ||
      data?.address?.neighbourhood ||
      data?.address?.city_district ||
      data?.address?.town ||
      data?.address?.city ||
      "Your area";

    res.json({
      display: data.display_name,
      area
    });

  } catch (err) {
    res.status(500).json({ error: "geocode failed" });
  }
});

// ================= GET USER PROFILE =================
router.get("/user-profile/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE USER PROFILE =================
router.post("/update-profile", async (req, res) => {
  try {
    const { phone, name } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name;
    await user.save();

    res.json({ message: "Profile updated", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE HOTEL LOCATION =================
router.post("/update-hotel-location", async (req, res) => {
  try {
    const { phone, lat, lng } = req.body;

    const hotel = await Hotel.findOne({ phone });
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    hotel.latitude = lat ? Number(lat) : null;
    hotel.longitude = lng ? Number(lng) : null;

    await hotel.save();

    res.json({ message: "Hotel location updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= HOTEL ORDERS =================
router.get("/hotel-orders/:hotelName", async (req, res) => {
  try {
    const orders = await Order.find({
      hotelName: req.params.hotelName
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= ADD TO CART =================
router.post("/add-to-cart", async (req, res) => {
  try {
    const { userPhone, foodId } = req.body;

    let cart = await Cart.findOne({ userPhone });

    if (!cart) {
      cart = new Cart({ userPhone, items: [] });
    }

    const existing = cart.items.find(
      item => item.foodId.toString() === foodId
    );

    if (existing) existing.qty += 1;
    else cart.items.push({ foodId, qty: 1 });

    cart.updatedAt = new Date();
    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= GET CART =================
router.get("/cart/:phone", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userPhone: req.params.phone })
      .populate("items.foodId");

    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= UPDATE CART ITEM =================
router.post("/update-cart", async (req, res) => {
  try {
    const { userPhone, foodId, qty } = req.body;

    const cart = await Cart.findOne({ userPhone });
    if (!cart) return res.json({ items: [] });

    const item = cart.items.find(
      i => i.foodId.toString() === foodId
    );

    if (item) {
      item.qty = qty;
      if (qty <= 0) {
        cart.items = cart.items.filter(
          i => i.foodId.toString() !== foodId
        );
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/update-order-status", async (req, res) => {
  const { orderId, status } = req.body;

  const updateData = { status };

  // ✅ When delivered, store delivery timestamp
  if (status === "delivered") {
    updateData.deliveredAt = new Date();
  }

  await Order.findByIdAndUpdate(orderId, updateData);

  res.json({ ok: true });
});

// ADD ORDER RATING
router.post("/rate-order", async (req, res) => {
  const { orderId, deliveryRating, hotelRating } = req.body;

  await Order.findByIdAndUpdate(orderId, {
    deliveryRating,
    hotelRating
  });

  res.json({ ok: true });
});

// ================= CLEAR CART =================
router.post("/clear-cart", async (req, res) => {
  try {
    const { userPhone } = req.body;
    await Cart.findOneAndDelete({ userPhone });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 AUTO STATUS SIMULATION (CINEMATIC)
const simulateOrderFlow = async (orderId) => {

  const timeline = [
    { status: "order placed", delay: 0, eta: 30 },
    { status: "preparing", delay: 5000, eta: 25 },
    { status: "picked", delay: 10000, eta: 20 },
    { status: "on the way", delay: 15000, eta: 15 },
    { status: "near", delay: 22000, eta: 5 },
    { status: "delivered", delay: 30000, eta: 0 }
  ];

  timeline.forEach(step => {
    setTimeout(async () => {
      await Order.findByIdAndUpdate(orderId, {
        status: step.status,
        eta: step.eta
      });
    }, step.delay);
  });

};

router.get("/order-status/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.json({ status: "order placed" });

  res.json({
    status: order.status,
    eta: order.eta || 0,

    riderName: order.riderName || "Rider",
    riderPhone: order.riderPhone || "0000000000",
    bikeNumber: order.bikeNumber || "TN 00 AB 0000",

    userLat: order.userLat,
    userLng: order.userLng,
    hotelLat: order.hotelLat,
    hotelLng: order.hotelLng
  });
});

// ===================================================
// 🏥 AUTO NGO TRANSFER ENGINE (National Model)
// ===================================================

const checkAndTransferToNGO = async () => {
  try {

    const now = new Date();

    const expiredFoods = await Food.find({
      expiryTime: { $lt: now },
      quantity: { $gt: 0 },
      isTransferredToNGO: false
    });

    for (let food of expiredFoods) {

      // Transfer remaining quantity
      food.isTransferredToNGO = true;
      food.ngoTransferredQty = food.quantity;
      food.ngoPickupStatus = "notified";

      await food.save();

      console.log(
        `NGO Transfer: ${food.foodName} (${food.ngoTransferredQty}) from ${food.hotelName}`
      );

      // 🔔 Here you can integrate SMS / Email / Push Notification
    }

  } catch (err) {
    console.log("NGO Engine Error:", err.message);
  }
};

// 🔁 Run every 1 minute
setInterval(checkAndTransferToNGO, 60000);


// ================= NGO GET AVAILABLE FOODS =================
router.get("/ngo-foods", async (req, res) => {
  try {

    const foods = await Food.find({
      isTransferredToNGO: true,
      ngoPickupStatus: { $ne: "collected" }
    });

    res.json(foods);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= NGO MARK COLLECTED =================
router.post("/ngo-collect", async (req, res) => {
  try {

    const { foodId } = req.body;

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ message: "Food not found" });

    food.ngoPickupStatus = "collected";
    await food.save();

    res.json({ message: "Food collected successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/hotel-complaints/:hotelName", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      hotelName: req.params.hotelName
    }).sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/resolve-complaint", async (req, res) => {
  try {
    const { complaintId } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "resolved";
    complaint.resolvedAt = new Date();

    await complaint.save();

    res.json({ message: "Complaint resolved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= ADMIN STATS =================
router.get("/stats", async (req, res) => {
  try {
    const totalHotels = await Hotel.countDocuments();
    const totalFoods = await Food.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalComplaints = await Complaint.countDocuments();

    const suspendedHotels = await Hotel.countDocuments({
      verifiedBadge: "suspended"
    });

    res.json({
      totalHotels,
      totalFoods,
      totalOrders,
      totalComplaints,
      suspendedHotels
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;