import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function TrackOrder() {
  const { state } = useLocation();
  const { food, address, payment } = state;

  const [status, setStatus] = useState("Preparing");

  useEffect(() => {
    const map = L.map("map").setView([13.0827, 80.2707], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
      .addTo(map);

    const hotel = [13.0827, 80.2707];
    const user = [13.07, 80.25];

    const bikeIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972185.png",
      iconSize: [40, 40]
    });

    let marker = L.marker(hotel, { icon: bikeIcon }).addTo(map);

    let progress = 0;

    const interval = setInterval(() => {
      progress += 0.05;

      const lat = hotel[0] + (user[0] - hotel[0]) * progress;
      const lng = hotel[1] + (user[1] - hotel[1]) * progress;

      marker.setLatLng([lat, lng]);

      if (progress >= 1) {
        clearInterval(interval);
        setStatus("Delivered");
      } else if (progress > 0.5) {
        setStatus("On the way");
      }

    }, 1000);

  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-6">

      <h1 className="text-3xl mb-4">Tracking Order</h1>

      <p>Food: {food.foodName}</p>
      <p>Address: {address}</p>
      <p>Payment: {payment}</p>

      <h2 className="mt-4 text-xl">Status: {status}</h2>

      <div id="map" style={{ height: "500px", marginTop: "20px" }}></div>

    </div>
  );
}