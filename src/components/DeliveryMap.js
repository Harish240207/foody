import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { FaMotorcycle, FaCheckCircle } from "react-icons/fa";
import ReviewPopup from "./ReviewPopup";

export default function DeliveryMap({
  hotelLat,
  hotelLng,
  deliveryLat,
  deliveryLng,
  onClose,
  food,
  userPhone
}) {

  // 🔒 SAFE FALLBACK COORDS (prevents undefined crash)
  const safeHotelLat = hotelLat || 13.0827;
  const safeHotelLng = hotelLng || 80.2707;
  const safeDeliveryLat = deliveryLat || 13.0927;
  const safeDeliveryLng = deliveryLng || 80.2807;

  const hotel = [safeHotelLat, safeHotelLng];
  const delivery = [safeDeliveryLat, safeDeliveryLng];

  const [bikePos, setBikePos] = useState(hotel);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(60);
  const [delivered, setDelivered] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const bikeIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
    iconSize: [40, 40]
  });

  // 🚚 BIKE SIMULATION
  useEffect(() => {

    let p = 0;

    const interval = setInterval(() => {

      p += 0.02;

      const lat = safeHotelLat + (safeDeliveryLat - safeHotelLat) * p;
      const lng = safeHotelLng + (safeDeliveryLng - safeHotelLng) * p;

      setBikePos([lat, lng]);
      setProgress(p);
      setEta(prev => Math.max(prev - 1, 0));

      if (p >= 1) {
        clearInterval(interval);

        setDelivered(true);

        setTimeout(() => {
          alert("🍱 Food delivered successfully!");
          setShowReview(true);
        }, 600);
      }

    }, 1000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 bg-[#111] text-white shadow">
        <h2 className="text-xl font-bold">Live Delivery Tracking</h2>
        <button onClick={onClose} className="text-red-400">Close</button>
      </div>

      {/* MAP */}
      <div className="flex-1">
        <MapContainer center={hotel} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Marker position={hotel} />
          <Marker position={delivery} />
          <Polyline positions={[hotel, delivery]} color="blue" />
          <Marker position={bikePos} icon={bikeIcon} />
        </MapContainer>
      </div>

      {/* BOTTOM PANEL */}
      <div className="bg-[#111] text-white p-5 space-y-4">

        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Arriving in</p>
            <h3 className="text-2xl font-bold">{eta}s</h3>
          </div>

          <div className="flex items-center gap-2">
            <FaMotorcycle className="text-green-400 text-2xl" />
            <span>Rider on the way</span>
          </div>
        </div>

        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="bg-[#1c1c1c] p-4 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Delivery Partner</p>
            <h3 className="font-bold">Ravi Kumar</h3>
            <p className="text-xs text-gray-400">Bike TN 09 AB 1234</p>
          </div>

          <button className="bg-green-600 px-4 py-2 rounded-lg">
            Call
          </button>
        </div>

        {delivered && (
          <div className="bg-green-600 p-3 rounded-xl text-center font-bold flex items-center justify-center gap-2">
            <FaCheckCircle />
            Order Delivered 🎉
          </div>
        )}

      </div>

      {/* ⭐ REVIEW */}
      {showReview && (
        <ReviewPopup
          food={food}
          userPhone={userPhone}
          onClose={() => {
            setShowReview(false);
            onClose();
          }}
        />
      )}

    </div>
  );
}