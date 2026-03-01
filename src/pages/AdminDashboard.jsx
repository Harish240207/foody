import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    complaints: 0,
    openComplaints: 0,
    hotels: 0,
    suspended: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const complaintsRes = await axios.get("http://localhost:5000/api/complaints");
      const hotelsRes = await axios.get("http://localhost:5000/api/hotels");

      const allComplaints = complaintsRes.data || [];
      const allHotels = hotelsRes.data || [];

      setStats({
        complaints: allComplaints.length,
        openComplaints: allComplaints.filter(
          c => !c.status || c.status === "open"
        ).length,
        hotels: allHotels.length,
        suspended: allHotels.filter(
          h => h.verifiedBadge === "suspended"
        ).length
      });

    } catch (err) {
      console.error("Admin stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-3xl font-bold mb-8">
        🛡 Platform Admin Dashboard
      </h1>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-6 mb-10">

            <StatCard
              title="Total Complaints"
              value={stats.complaints}
              color="text-red-500"
            />

            <StatCard
              title="Open Complaints"
              value={stats.openComplaints}
              color="text-orange-500"
            />

            <StatCard
              title="Total Hotels"
              value={stats.hotels}
              color="text-blue-500"
            />

            <StatCard
              title="Suspended Hotels"
              value={stats.suspended}
              color="text-purple-500"
            />

          </div>

          {/* Action Section */}
          <div className="flex gap-4">

            <button
              onClick={() => navigate("/admin-complaints")}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl shadow"
            >
              View All Complaints
            </button>

            <button
              onClick={loadStats}
              className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-xl shadow"
            >
              Refresh Stats
            </button>

          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
      <h2 className="text-gray-500">{title}</h2>
      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  );
}