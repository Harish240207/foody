import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [status, setStatus] = useState("order placed");
  const [eta, setEta] = useState(30);
  const [bikePos, setBikePos] = useState(null);

  // 🔔 Toast State
  const [toast, setToast] = useState("");
  const shownStatuses = useRef(new Set());

  const travelStarted = useRef(false);
  const startTime = useRef(null);
  const duration = useRef(null);
  const animationRef = useRef(null);

  // ================= BIKE ICON =================
  const bikeIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
    iconSize: [40, 40],
  });

  // ================= TOAST FUNCTION =================
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  // ================= FETCH ORDER STATUS =================
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/order-status/${orderId}`
        );

        const data = res.data;
        if (!data) return;

        setOrderData(data);
        setStatus(data.status);
        setEta(data.eta || 0);

        // ================= STATUS NOTIFICATIONS =================
        if (!shownStatuses.current.has(data.status)) {
          shownStatuses.current.add(data.status);

          if (data.status === "order placed")
            showToast("🧾 Order confirmed");

          if (data.status === "preparing")
            showToast("👨‍🍳 Food is being prepared");

          if (data.status === "picked")
            showToast("🛵 Rider picked your order");

          if (data.status === "on the way")
            showToast("📦 Order is on the way");

          if (data.status === "near")
            showToast("📍 Rider is nearby");

          if (data.status === "delivered")
            showToast("✅ Order delivered successfully");
        }

        // Start travel ONLY once when rider picks order
        if (
          data.status === "picked" &&
          !travelStarted.current &&
          data.hotelLat !== undefined
        ) {
          travelStarted.current = true;
          startTime.current = Date.now();
          duration.current = (data.eta || 20) * 1000;

          startSmoothMovement(data);
        }

        // Force finish on delivered
        if (data.status === "delivered" && data.userLat) {
          cancelAnimationFrame(animationRef.current);
          setBikePos([data.userLat, data.userLng]);
        }

      } catch (err) {
        console.log("Tracking error");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId]);

  // ================= SMOOTH MOVEMENT ENGINE =================
  const startSmoothMovement = (data) => {
    const { hotelLat, hotelLng, userLat, userLng } = data;

    // Set initial position
    setBikePos([hotelLat, hotelLng]);

    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      let progress = elapsed / duration.current;

      if (progress > 1) progress = 1;

      const lat =
        hotelLat + (userLat - hotelLat) * progress;

      const lng =
        hotelLng + (userLng - hotelLng) * progress;

      setBikePos([lat, lng]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // ================= SAFE MAP LOADING =================
  if (
    !orderData ||
    orderData.hotelLat === undefined ||
    orderData.userLat === undefined
  ) {
    return (
      <>
        <Navbar />
        <div className="p-20 text-center text-xl">
          Loading Live Tracking...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* 🔔 TOAST UI */}
      {toast && (
        <div className="fixed top-6 right-6 bg-black text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-pulse">
          {toast}
        </div>
      )}

      <div className="min-h-screen bg-[#fff7ed] p-10">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">

          <h1 className="text-2xl font-bold mb-2">
            Live Order Tracking
          </h1>

          <p className="text-gray-500 mb-6">
            Status: {status} | ETA: {eta}s
          </p>

          <div className="h-[400px] rounded-xl overflow-hidden">
            <MapContainer
              center={[orderData.userLat, orderData.userLng]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Hotel Marker */}
              <Marker position={[orderData.hotelLat, orderData.hotelLng]} />

              {/* User Marker */}
              <Marker position={[orderData.userLat, orderData.userLng]} />

              {/* Moving Bike */}
              {bikePos && (
                <Marker position={bikePos} icon={bikeIcon} />
              )}

              {/* Route Line */}
              <Polyline
                positions={[
                  [orderData.hotelLat, orderData.hotelLng],
                  [orderData.userLat, orderData.userLng]
                ]}
                pathOptions={{ color: "orange", weight: 4 }}
              />
            </MapContainer>
          </div>

        </div>
      </div>
    </>
  );
}