import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/stats")
      .then(res => setStats(res.data));
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-10">
        <h2 className="text-3xl font-bold mb-10 text-center">
          Foody Admin Panel 📊
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <h3 className="text-xl font-bold">Food Listings</h3>
            <p className="text-3xl text-orange-500 mt-2">
              {stats.totalFoods}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <h3 className="text-xl font-bold">Orders Placed</h3>
            <p className="text-3xl text-green-500 mt-2">
              {stats.totalOrders}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow text-center">
            <h3 className="text-xl font-bold">Donations</h3>
            <p className="text-3xl text-blue-500 mt-2">
              {stats.totalDonations}
            </p>
          </div>

        </div>

        <div className="mt-10 text-center">
          <h3 className="text-2xl font-bold text-green-600">
            🌍 Meals Saved From Waste
          </h3>
        </div>
      </div>
    </>
  );
}