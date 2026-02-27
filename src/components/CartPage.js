import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function CartPage() {

  const navigate = useNavigate();
  const userPhone = localStorage.getItem("userPhone");

  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("UPI");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // LOAD CART
  const loadCart = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/cart/${userPhone}`
      );
      setCart(res.data.items || []);
    } catch {}
  };

  useEffect(() => {
    loadCart();
  }, []);

  // AUTOCOMPLETE
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (address.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
        );
        setSuggestions(res.data.slice(0, 5));
      } catch {}
    };

    fetchSuggestions();
  }, [address]);

  // DETECT LOCATION
  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/reverse-geocode?lat=${lat}&lng=${lng}`
        );
        setAddress(res.data.display);
      } catch {}
    });
  };

  // UPDATE QTY
  const updateQty = async (foodId, qty) => {
    await axios.post("http://localhost:5000/api/update-cart", {
      userPhone,
      foodId,
      qty
    });
    loadCart();
  };

  const removeItem = async (foodId) => {
    await axios.post("http://localhost:5000/api/update-cart", {
      userPhone,
      foodId,
      qty: 0
    });
    loadCart();
  };

  const total = cart.reduce(
    (sum, i) => sum + i.foodId.discountPrice * i.qty,
    0
  );

  // CHECKOUT
  const checkout = async () => {

    if (!address) return alert("Enter delivery address");
    if (cart.length === 0) return;

    try {
      setLoadingOrder(true);

      const firstItem = cart[0];

      const orderRes = await axios.post(
        "http://localhost:5000/api/order",
        {
          foodId: firstItem.foodId._id,
          userPhone,
          address,
          payment
        }
      );

      const orderId = orderRes.data._id;

      for (let i = 1; i < cart.length; i++) {
        await axios.post("http://localhost:5000/api/order", {
          foodId: cart[i].foodId._id,
          userPhone,
          address,
          payment
        });
      }

      await axios.post("http://localhost:5000/api/clear-cart", {
        userPhone
      });

      navigate(`/track/${orderId}`);

    } catch {
      alert("Order failed");
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc] px-6 md:px-16 py-10">

        <h1 className="text-3xl font-bold mb-10">Your Cart</h1>

        {cart.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-12 rounded-3xl shadow text-center"
          >
            <h2 className="text-xl font-semibold mb-2">
              Your cart is empty 🛒
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven’t added anything yet.
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="bg-[#fc8019] text-white px-8 py-3 rounded-xl font-semibold"
            >
              Browse Food
            </button>
          </motion.div>
        )}

        {cart.length > 0 && (
          <div className="grid md:grid-cols-3 gap-10">

            {/* LEFT SIDE - ITEMS */}
            <div className="md:col-span-2 space-y-6">

              {cart.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-3xl shadow-lg p-6 flex justify-between items-center"
                >

                  <div>
                    <h3 className="font-bold text-lg">
                      {item.foodId.foodName}
                    </h3>
                    <p className="text-gray-500">
                      ₹{item.foodId.discountPrice}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">

                    <div className="flex items-center border rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQty(item.foodId._id, item.qty - 1)}
                        className="px-3 py-1"
                      >
                        −
                      </button>
                      <span className="px-4">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.foodId._id, item.qty + 1)}
                        className="px-3 py-1"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.foodId._id)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>

                  </div>

                </motion.div>
              ))}

            </div>

            {/* RIGHT SIDE - SUMMARY */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8 h-fit sticky top-24"
            >

              <h2 className="text-xl font-bold mb-6">
                Order Summary
              </h2>

              <div className="flex justify-between mb-4">
                <span>Total</span>
                <span className="font-bold text-lg">₹{total}</span>
              </div>

              {/* ADDRESS */}
              <div className="relative mb-4">
                <div className="flex gap-2">
                  <input
                    placeholder="Delivery address"
                    className="border rounded-xl p-3 w-full"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />

                  <button
                    onClick={detectLocation}
                    className="bg-gray-200 px-3 rounded-xl"
                  >
                    📍
                  </button>
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute bg-white border w-full mt-1 rounded-xl shadow max-h-40 overflow-y-auto z-50">
                    {suggestions.map((s, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setAddress(s.display_name);
                          setSuggestions([]);
                        }}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {s.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PAYMENT */}
              <select
                className="border rounded-xl p-3 w-full mb-6"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                <option>UPI</option>
                <option>Cash</option>
              </select>

              <button
                onClick={checkout}
                disabled={loadingOrder}
                className="bg-[#fc8019] text-white w-full py-4 rounded-2xl font-bold shadow hover:scale-[1.02] transition disabled:opacity-50"
              >
                {loadingOrder ? "Placing Order..." : "Place Order"}
              </button>

            </motion.div>

          </div>
        )}

      </div>
    </>
  );
}