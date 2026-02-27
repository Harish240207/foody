import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function HotelMenu() {

  const { hotelId } = useParams();
  const navigate = useNavigate();

  const userPhone = localStorage.getItem("userPhone");
  const savedArea = localStorage.getItem("userArea") || "";

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showOrderBox, setShowOrderBox] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const [address, setAddress] = useState(savedArea);
  const [mode, setMode] = useState("delivery");

  const [placingOrder, setPlacingOrder] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // 🟢 Live time tracker
  const [now, setNow] = useState(Date.now());

  // ================= LOAD FOODS =================
  const loadFoods = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/foods-by-hotel/${hotelId}`
      );
      setFoods(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) loadFoods();
  }, [hotelId]);

  // 🟢 Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🟢 Auto refresh menu every 30 seconds (to remove expired items)
  useEffect(() => {
    const refresh = setInterval(() => {
      loadFoods();
    }, 30000);

    return () => clearInterval(refresh);
  }, [hotelId]);

  // ================= TIME LEFT FUNCTION =================
  const getTimeLeft = (expiryTime) => {
    const diff = new Date(expiryTime) - now;

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}m ${seconds}s left`;
  };

  // ================= ADD TO CART =================
  const addToCart = async (food) => {
    await axios.post("http://localhost:5000/api/add-to-cart", {
      userPhone,
      foodId: food._id
    });
    setCartCount(c => c + 1);
  };

  const openOrder = (food) => {
    setSelectedFood(food);
    setAddress(savedArea);
    setShowOrderBox(true);
  };

  const confirmOrder = async () => {

    if (mode === "delivery" && !address) {
      alert("Enter address");
      return;
    }

    try {
      setPlacingOrder(true);

      const res = await axios.post(
        "http://localhost:5000/api/order",
        {
          foodId: selectedFood._id,
          userPhone,
          address,
          payment: "UPI",
          mode
        }
      );

      const orderId = res.data._id;

      setShowOrderBox(false);

      setTimeout(() => {
        navigate(`/track/${orderId}`);
      }, 800);

    } 
    catch (err) {
      alert(err.response?.data?.message || "Item no longer available");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc]">

        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur sticky top-16 z-40 border-b">
          <div className="max-w-6xl mx-auto px-6 py-8">

            <motion.h1 
              initial={{opacity:0,y:20}}
              animate={{opacity:1,y:0}}
              className="text-4xl font-bold mb-2"
            >
              Restaurant Menu
            </motion.h1>

            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                ⭐ 4.3
              </span>
              <span>30 mins</span>
              <span>• Free delivery</span>
            </div>

            <motion.div
              initial={{opacity:0}}
              animate={{opacity:1}}
              className="mt-4 bg-orange-50 border border-orange-200 p-3 rounded-xl text-sm"
            >
              🔥 50% OFF on all surplus meals
            </motion.div>

          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">

          {loading && (
            <div className="text-center mt-20">
              Loading menu...
            </div>
          )}

          {!loading && foods.length === 0 && (
            <div className="text-center mt-20 text-gray-500">
              No foods available yet
            </div>
          )}

          {!loading && foods.length > 0 && (
            <div className="space-y-8">

              {foods.map((food, i) => (
                <motion.div
                  key={food._id}
                  initial={{opacity:0,y:30}}
                  animate={{opacity:1,y:0}}
                  transition={{delay:i*0.05}}
                  whileHover={{scale:1.02}}
                  className="bg-white rounded-3xl shadow-lg p-6 flex gap-6"
                >

                  <img
                    src={
                      food.image
                        ? `http://localhost:5000/uploads/${food.image}`
                        : "https://source.unsplash.com/400x300/?food"
                    }
                    className="w-36 h-28 object-cover rounded-xl"
                  />

                  <div className="flex-1">

                    <h2 className="font-bold text-xl">
                      {food.foodName}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {food.category === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
                    </p>

                    <div className="mt-1">
                      <span className="line-through text-gray-400 mr-2">
                        ₹{food.originalPrice}
                      </span>
                      <span className="text-orange-600 font-bold text-lg">
                        ₹{food.discountPrice}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      Qty left: {food.quantity}
                    </p>

                    {/* 🟢 TIME LEFT DISPLAY */}
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      ⏳ {getTimeLeft(food.expiryTime)}
                    </p>

                  </div>

                  <div className="flex flex-col justify-center gap-3">

                    <button
                      onClick={() => addToCart(food)}
                      className="border border-orange-500 text-orange-500 px-5 py-2 rounded-xl font-semibold hover:bg-orange-50"
                    >
                      ADD
                    </button>

                    <button
                      onClick={() => openOrder(food)}
                      className="bg-orange-500 text-white px-5 py-2 rounded-xl shadow hover:scale-105 transition"
                    >
                      Order
                    </button>

                  </div>

                </motion.div>
              ))}

            </div>
          )}

        </div>

        {/* FLOATING CART */}
        {cartCount > 0 && (
          <motion.div
            initial={{y:100}}
            animate={{y:0}}
            onClick={() => navigate("/cart")}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-10 py-4 rounded-full shadow-2xl font-bold cursor-pointer"
          >
            🛒 View Cart ({cartCount})
          </motion.div>
        )}

      </div>

      {/* ORDER POPUP */}
      {showOrderBox && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">

          <motion.div
            initial={{scale:0.8,opacity:0}}
            animate={{scale:1,opacity:1}}
            className="bg-white p-6 rounded-2xl w-96 shadow-2xl"
          >

            <h2 className="text-xl font-bold mb-3">
              {selectedFood.foodName}
            </h2>

            <select
              className="border p-3 w-full mb-3 rounded-lg"
              value={mode}
              onChange={e => setMode(e.target.value)}
            >
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
            </select>

            {mode === "delivery" && (
              <input
                placeholder="Address"
                className="border p-3 w-full mb-3 rounded-lg"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            )}

            <button
              onClick={confirmOrder}
              disabled={placingOrder}
              className="bg-[#fc8019] text-white w-full py-3 rounded-xl font-bold"
            >
              {placingOrder ? "Placing..." : "Confirm Order"}
            </button>

          </motion.div>
        </div>
      )}

    </>
  );
}