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

  // Complaint States
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reason, setReason] = useState("Spoiled Food");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [proof, setProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    switch (status?.toLowerCase()) {
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

  const openReportModal = (order) => {
    setSelectedOrder(order);
    setReason("Spoiled Food");
    setSeverity("medium");
    setDescription("");
    setProof(null);
    setShowModal(true);
  };

  const submitComplaint = async () => {
    if (!selectedOrder) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("orderId", selectedOrder._id);
      formData.append("reason", reason);
      formData.append("severity", severity);
      formData.append("description", description);

      if (proof) {
        formData.append("proof", proof);
      }

      await axios.post(
        "http://localhost:5000/api/report-issue",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Complaint submitted successfully");

      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id
            ? { ...o, complaintSubmitted: true }
            : o
        )
      );

      setShowModal(false);

    } catch (err) {
      console.log("Complaint Error:", err.response?.data);
      alert(err.response?.data?.message || "Error submitting complaint");
    }

    setSubmitting(false);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-6 py-10">

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

                    <img
                      src={
                        order.foodImage
                          ? `http://localhost:5000/uploads/${order.foodImage}`
                          : `https://source.unsplash.com/400x300/?food`
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://source.unsplash.com/400x300/?restaurant";
                      }}
                      alt=""
                      className="w-full md:w-60 h-48 object-cover"
                    />

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

                        <div className="flex gap-3">

                          {order.status?.toLowerCase() !== "delivered" && (
                            <button
                              onClick={() => navigate(`/track/${order._id}`)}
                              className="bg-black text-white px-5 py-2 rounded-xl text-sm hover:scale-105 transition"
                            >
                              Track Order
                            </button>
                          )}

                          {order.status?.toLowerCase() === "delivered" && !order.complaintSubmitted && (
                            <button
                              onClick={() => openReportModal(order)}
                              className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600 transition"
                            >
                              Report Issue
                            </button>
                          )}

                          {order.complaintSubmitted && (
                            <span className="text-xs text-red-500 font-medium">
                              Complaint Submitted
                            </span>
                          )}

                        </div>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

            <h2 className="text-xl font-bold mb-4">
              Report Issue
            </h2>

            <select
              className="w-full border p-2 rounded mb-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option>Spoiled Food</option>
              <option>Wrong Item</option>
              <option>Hygiene Issue</option>
              <option>Quantity Issue</option>
              <option>Other</option>
            </select>

            <select
              className="w-full border p-2 rounded mb-3"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <textarea
              placeholder="Describe the issue..."
              className="w-full border p-2 rounded mb-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="file"
              onChange={(e) => setProof(e.target.files[0])}
              className="mb-3"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={submitComplaint}
                disabled={submitting}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>

          </div>
        </div>
      )}

    </>
  );
}