import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function Profile() {

  const navigate = useNavigate();
  const phone = localStorage.getItem("userPhone");
  const area = localStorage.getItem("userArea") || "Not set";

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!phone) {
      navigate("/user-login");
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/user-profile/${phone}`
      );
      setName(res.data.name || "");
      setLoading(false);
    } catch (err) {
      alert("Error loading profile");
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      await axios.post("http://localhost:5000/api/update-profile", {
        phone,
        name
      });
      alert("Profile updated");
    } catch {
      alert("Error updating profile");
    }
  };

  const logout = () => {
    localStorage.removeItem("userPhone");
    navigate("/");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          Loading profile...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* 🌌 CINEMATIC BACKGROUND */}
      <div className="min-h-screen bg-gradient-to-b from-[#fff7ed] via-white to-[#f1f5f9]">

        <div className="max-w-3xl mx-auto px-6 py-10">

          {/* PROFILE HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 flex items-center gap-6 border"
          >

            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg">
              {name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{name}</h1>
              <p className="text-gray-500">{phone}</p>

              <div className="mt-2 text-sm text-gray-600">
                📍 {area}
              </div>
            </div>

          </motion.div>

          {/* ACCOUNT SETTINGS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border"
          >

            <h2 className="text-xl font-bold mb-6">
              Account Settings
            </h2>

            <label className="text-gray-500 text-sm">Name</label>
            <input
              className="w-full p-3 border rounded-xl mb-4 mt-1"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <label className="text-gray-500 text-sm">Phone</label>
            <input
              className="w-full p-3 border rounded-xl mb-6 bg-gray-100"
              value={phone}
              disabled
            />

            <button
              onClick={saveProfile}
              className="w-full bg-[#fc8019] text-white py-3 rounded-xl font-bold shadow hover:scale-[1.02] transition"
            >
              Save Changes
            </button>

          </motion.div>

          {/* QUICK ACTIONS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid md:grid-cols-2 gap-6"
          >

            <div
              onClick={() => navigate("/user-dashboard")}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow cursor-pointer hover:scale-[1.02] transition border"
            >
              <h3 className="font-bold text-lg">My Orders</h3>
              <p className="text-gray-500 text-sm">
                Track and manage your orders
              </p>
            </div>

            <div
              onClick={() => navigate("/explore")}
              className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow cursor-pointer hover:scale-[1.02] transition border"
            >
              <h3 className="font-bold text-lg">Browse Food</h3>
              <p className="text-gray-500 text-sm">
                Discover meals near you
              </p>
            </div>

          </motion.div>

          {/* LOGOUT */}
          <div className="mt-10">
            <button
              onClick={logout}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold shadow hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </>
  );
}