import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function NGODashboard() {

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFoods = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/ngo-foods"
      );
      setFoods(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const markCollected = async (foodId) => {
    await axios.post(
      "http://localhost:5000/api/ngo-collect",
      { foodId }
    );
    loadFoods();
  };

  const totalQty = foods.reduce(
    (sum, f) => sum + (f.ngoTransferredQty || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#fff7ed] p-10">

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        🏥 NGO Surplus Dashboard
      </motion.h1>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">

        <StatCard
          title="Available Items"
          value={foods.length}
          color="bg-orange-500"
        />

        <StatCard
          title="Total Quantity"
          value={totalQty}
          color="bg-green-600"
        />

        <StatCard
          title="Pending Pickups"
          value={
            foods.filter(f => f.ngoPickupStatus === "notified").length
          }
          color="bg-blue-600"
        />

      </div>

      {loading && (
        <div className="text-gray-500">
          Loading surplus foods...
        </div>
      )}

      {!loading && foods.length === 0 && (
        <div className="bg-white p-10 rounded-3xl shadow text-center">
          No surplus food available right now 🍃
        </div>
      )}

      {!loading && foods.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8">

          {foods.map((food, i) => (
            <motion.div
              key={food._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >

              <img
                src={
                  food.image
                    ? `http://localhost:5000/uploads/${food.image}`
                    : "https://source.unsplash.com/600x400/?food"
                }
                className="h-52 w-full object-cover"
              />

              <div className="p-6">

                <h2 className="text-xl font-bold mb-1">
                  {food.foodName}
                </h2>

                <p className="text-gray-500 text-sm mb-2">
                  Hotel: {food.hotelName}
                </p>

                <div className="flex justify-between items-center mb-4">

                  <span className="text-lg font-semibold text-orange-600">
                    Qty: {food.ngoTransferredQty}
                  </span>

                  <span className={`px-3 py-1 rounded-full text-xs ${
                    food.ngoPickupStatus === "notified"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {food.ngoPickupStatus}
                  </span>

                </div>

                {food.ngoPickupStatus !== "collected" && (
                  <button
                    onClick={() => markCollected(food._id)}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
                  >
                    Mark as Collected
                  </button>
                )}

              </div>
            </motion.div>
          ))}

        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`${color} text-white p-6 rounded-3xl shadow-xl`}>
      <h3 className="text-sm opacity-80">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}