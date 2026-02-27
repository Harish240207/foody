import { useState, useEffect } from "react";
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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function HotelDashboard() {

  const navigate = useNavigate();
  const hotelPhone = localStorage.getItem("hotelPhone");
  const hotelName = localStorage.getItem("hotelName");

  const [orders, setOrders] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [hotel, setHotel] = useState(null);

  const [form, setForm] = useState({
    hotelName: hotelName || "",
    foodName: "",
    quantity: "",
    originalPrice: "",
    discountPrice: "",
    expiryTime: "",
    category: "veg"
  });

  useEffect(() => {
    if (!hotelPhone) navigate("/hotel-login");
  }, [hotelPhone, navigate]);

  // 🔥 LOAD HOTEL DETAILS (we need hotel._id)
  useEffect(() => {
    const loadHotel = async () => {
      const res = await axios.get("http://localhost:5000/api/hotels");
      const myHotel = res.data.find(h => h.phone === hotelPhone);
      setHotel(myHotel);
    };
    loadHotel();
  }, [hotelPhone]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔥 FIXED SUBMIT — NOW SENDS hotelId
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      // 🔥 IMPORTANT: attach hotelId
      if (hotel?._id) {
        formData.append("hotelId", hotel._id);
      }

      if (hotel?.location) {
        formData.append("location", hotel.location);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post(
        "http://localhost:5000/api/add-food",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Food added successfully 🍱");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Error adding food");
    }
  };

  const updateHotelLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      await axios.post(
        "http://localhost:5000/api/update-hotel-location",
        { phone: hotelPhone, lat, lng }
      );

      alert("Hotel location updated");
      window.location.reload();
    });
  };

  // LOAD ORDERS
  useEffect(() => {
    if (!hotelName) return;

    axios
      .get(`http://localhost:5000/api/hotel-orders/${hotelName}`)
      .then((res) => setOrders(res.data));
  }, [hotelName]);

  const totalEarnings = orders.reduce((sum, o) => sum + o.price, 0);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#fff7ed] px-6 md:px-16 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Partner Dashboard 🏨</h1>
          <p className="text-gray-500">Manage surplus food & track orders</p>
        </div>

        {/* ANALYTICS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-gray-500 text-sm">Total Earnings</p>
            <h2 className="text-2xl font-bold text-[#fc8019] mt-2">
              ₹{totalEarnings}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-gray-500 text-sm">Orders</p>
            <h2 className="text-2xl font-bold mt-2">
              {orders.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-gray-500 text-sm">Hotel</p>
            <h2 className="text-lg font-semibold mt-2">
              {hotelName}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-gray-500 text-sm">Status</p>
            <h2 className="text-lg font-semibold text-green-600 mt-2">
              Active
            </h2>
          </div>
        </div>

        {/* MAP */}
        {hotel && hotel.latitude && hotel.longitude && (
          <div className="bg-white rounded-2xl shadow p-6 mb-10">
            <h3 className="font-semibold mb-4">Your Hotel Location</h3>

            <div className="h-[350px] rounded-xl overflow-hidden">
              <MapContainer
                center={[hotel.latitude, hotel.longitude]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[hotel.latitude, hotel.longitude]}>
                  <Popup>
                    <b>{hotel.hotelName}</b>
                    <br />
                    {hotel.location}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <button
              onClick={updateHotelLocation}
              className="mt-4 bg-[#fc8019] text-white px-4 py-2 rounded-lg"
            >
              Update My Location
            </button>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 gap-10 max-w-6xl">

          {/* ADD FOOD FORM */}
          <div className="bg-white rounded-2xl shadow p-8">
            <h3 className="text-xl font-bold mb-6">Add Surplus Food</h3>

            <div className="space-y-4">
              <input name="foodName" placeholder="Food Name"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg" />

              <input name="quantity" type="number"
                placeholder="Quantity"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg" />

              <input name="originalPrice" type="number"
                placeholder="Original Price"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg" />

              <input name="discountPrice" type="number"
                placeholder="Discount Price"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg" />

              <input type="datetime-local"
                name="expiryTime"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg" />

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="veg">🟢 Veg</option>
                <option value="nonveg">🔴 Non-Veg</option>
              </select>

              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
              />

              <button
                onClick={handleSubmit}
                className="w-full bg-[#fc8019] text-white py-3 rounded-lg font-semibold"
              >
                Add Food
              </button>
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="bg-white rounded-2xl shadow p-8">
            <h3 className="text-xl font-bold mb-6">Recent Orders</h3>

            {orders.length === 0 && (
              <p className="text-gray-500">No orders yet</p>
            )}

            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="flex justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{o.foodName}</p>
                    <p className="text-sm text-gray-500">
                      ₹{o.price}
                    </p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}