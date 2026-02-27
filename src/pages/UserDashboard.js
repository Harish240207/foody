import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function UserDashboard() {

  const navigate = useNavigate();
  const userPhone = localStorage.getItem("userPhone");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userPhone) navigate("/user-login");
  }, [userPhone, navigate]);

  useEffect(() => {
    if (userPhone) {
      axios
        .get(`http://localhost:5000/api/my-orders/${userPhone}`)
        .then((res) => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [userPhone]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-600";
      case "on the way":
        return "bg-orange-100 text-orange-600";
      case "preparing":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc]">

        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold text-gray-800">
              My Orders
            </h1>
            <p className="text-gray-500 mt-2">
              Track and manage your food orders
            </p>
          </motion.div>

          {loading && (
            <div className="text-center mt-20 text-gray-500">
              Loading orders...
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="bg-white rounded-2xl shadow p-10 text-center">
              <p className="text-gray-500 text-lg">
                You haven't placed any orders yet
              </p>
            </div>
          )}

          <div className="space-y-8">

            {orders.map((order, i) => {

              const formattedDate = new Date(order.createdAt).toLocaleDateString();

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >

                  <div className="flex flex-col md:flex-row">

                    {/* Image */}
                    <img
                      src={
                        order.foodImage
                          ? `http://localhost:5000/uploads/${order.foodImage}`
                          : `https://source.unsplash.com/400x300/?food`
                      }
                      alt=""
                      className="w-full md:w-60 h-48 object-cover"
                    />

                    {/* Details */}
                    <div className="flex-1 p-6">

                      <div className="flex justify-between items-start">

                        <div>
                          <h2 className="text-xl font-bold">
                            {order.foodName}
                          </h2>

                          <p className="text-gray-500 text-sm mt-1">
                            {order.hotelName}
                          </p>

                          <p className="text-gray-400 text-xs mt-1">
                            Ordered on {formattedDate}
                          </p>

                        </div>

                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}
                        >
                          {order.status}
                        </div>

                      </div>

                      <div className="mt-4 flex justify-between items-center">

                        <p className="text-[#fc8019] font-bold text-lg">
                          ₹{order.price}
                        </p>

                        {order.status !== "delivered" && (
                          <button
                            onClick={() => navigate(`/track/${order._id}`)}
                            className="bg-black text-white px-5 py-2 rounded-xl text-sm hover:scale-105 transition"
                          >
                            Track Order
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                </motion.div>
              );
            })}

          </div>

        </div>
      </div>
    </>
  );
}