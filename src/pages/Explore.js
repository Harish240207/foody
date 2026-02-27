import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { motion } from "framer-motion";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function Explore() {

  const navigate = useNavigate();

  const userPhone = localStorage.getItem("userPhone");
  const userLat = parseFloat(localStorage.getItem("lat"));
  const userLng = parseFloat(localStorage.getItem("lng"));
  const userArea = localStorage.getItem("userArea");

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!userPhone) navigate("/user-login");
  }, [userPhone, navigate]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const loadHotels = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/hotels");
      let data = res.data;

      if (userLat && userLng) {
        data = data
          .map(hotel => {
            const distance = getDistance(
              userLat,
              userLng,
              hotel.latitude,
              hotel.longitude
            );
            return { ...hotel, distance };
          })
          .sort((a, b) => a.distance - b.distance);
      }

      setHotels(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const openHotel = (hotel) => {
    navigate(`/hotel/${hotel._id}`);
  };

  const filteredHotels = hotels
    .filter(h => {
      if (filter === "near") return h.distance <= 2;
      return true;
    })
    .filter(h =>
      h.hotelName.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc]">

        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-xl sticky top-16 z-40 border-b">
          <div className="max-w-7xl mx-auto px-6 py-6">

            <p className="text-sm text-gray-500">Delivery to</p>
            <p className="font-bold text-xl mb-4">📍 {userArea}</p>

            <motion.input
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              placeholder="Search restaurants or dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border p-4 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="flex gap-3 mt-5 overflow-x-auto pb-2">
              <FilterBtn label="All" active={filter==="all"} onClick={()=>setFilter("all")} />
              <FilterBtn label="Near Me" active={filter==="near"} onClick={()=>setFilter("near")} />

              <button
                onClick={() => setView(view === "list" ? "map" : "list")}
                className="px-5 py-2 rounded-full bg-black text-white text-sm shadow"
              >
                {view === "list" ? "Map View" : "List View"}
              </button>
            </div>

          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">

          {loading && (
            <div className="text-center mt-20 text-gray-500">
              Loading restaurants...
            </div>
          )}

          {view === "list" && !loading && (
            <div className="grid md:grid-cols-3 gap-10">

              {filteredHotels.map((hotel, i) => {

                const rating = (4 + Math.random()).toFixed(1);
                const time = Math.floor(15 + Math.random() * 20);

                return (
                  <motion.div
                    key={hotel._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    onClick={() => openHotel(hotel)}
                    className="bg-white rounded-3xl shadow-lg cursor-pointer overflow-hidden relative"
                  >
                    {/* Safety Badge */}
                    {hotel.verifiedBadge !== "unverified" && (
                      <div className={`absolute top-3 right-3 px-3 py-1 text-xs rounded-full text-white shadow
                        ${
                          hotel.verifiedBadge === "verified"
                            ? "bg-blue-600"
                            : hotel.verifiedBadge === "trusted"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }
                      `}>
                        {hotel.verifiedBadge === "verified" && "✔ Verified"}
                        {hotel.verifiedBadge === "trusted" && "🛡 Trusted"}
                        {hotel.verifiedBadge === "suspended" && "⚠ Suspended"}
                      </div>
                    )}

                    <div className="relative">
                      <img
                        src={
                          hotel.image
                            ? `http://localhost:5000/uploads/${hotel.image}`
                            : "https://source.unsplash.com/400x300/?food"
                        }
                        className="h-52 w-full object-cover"
                      />

                      <div className="absolute bottom-3 left-3 bg-black text-white px-3 py-1 text-xs rounded-full">
                        50% OFF
                      </div>
                    </div>

                    <div className="p-5">
                      <h2 className="font-bold text-lg flex items-center gap-2">
                        {hotel.hotelName}
                      </h2>

                      <div className="flex items-center gap-2 text-sm mt-2">
                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">
                          ⭐ {rating}
                        </span>
                        <span>{time} mins</span>
                        {hotel.distance && (
                          <span>• {hotel.distance.toFixed(1)} km</span>
                        )}
                      </div>

                      {hotel.riskScore > 40 && (
                        <p className="text-xs text-red-500 mt-2">
                          ⚠ Under safety observation
                        </p>
                      )}

                      <p className="text-gray-500 text-sm mt-2">
                        {hotel.location}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

            </div>
          )}

          {view === "map" && userLat && userLng && (
            <motion.div
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              className="h-[600px] rounded-3xl overflow-hidden shadow-xl"
            >
              <MapContainer
                center={[userLat, userLng]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[userLat, userLng]}>
                  <Popup>You are here</Popup>
                </Marker>

                {filteredHotels.map(hotel => (
                  <Marker
                    key={hotel._id}
                    position={[hotel.latitude, hotel.longitude]}
                  >
                    <Popup>
                      <b>{hotel.hotelName}</b>
                      <br />
                      <button
                        onClick={() => openHotel(hotel)}
                        style={{
                          marginTop: "6px",
                          background: "#f97316",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px"
                        }}
                      >
                        View Menu
                      </button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
}

function FilterBtn({label,active,onClick}){
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm transition ${
        active
          ? "bg-orange-500 text-white shadow"
          : "bg-white border"
      }`}
    >
      {label}
    </button>
  );
}