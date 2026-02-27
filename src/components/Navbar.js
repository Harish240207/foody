import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {

  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const [showLocationBox, setShowLocationBox] = useState(false);
  const [addressInput, setAddressInput] = useState("");

  const userArea = localStorage.getItem("userArea");
  const userPhone = localStorage.getItem("userPhone");

  // 🔥 LOAD CART COUNT FROM DB
  const loadCartCount = async () => {
    if (!userPhone) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/cart/${userPhone}`
      );

      const items = res.data?.items || [];
      const count = items.reduce((sum, i) => sum + i.qty, 0);

      setCartCount(count);
    } catch (err) {
      console.log("cart count error");
    }
  };

  useEffect(() => {
    loadCartCount();

    // update when returning to tab
    window.addEventListener("focus", loadCartCount);
    return () => window.removeEventListener("focus", loadCartCount);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // 📍 Detect location
  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const res = await axios.get(
        `http://localhost:5000/api/reverse-geocode?lat=${lat}&lng=${lng}`
      );

      localStorage.setItem("lat", lat);
      localStorage.setItem("lng", lng);
      localStorage.setItem("userArea", res.data.display);

      window.location.reload();
    });
  };

  const saveAddress = () => {
    localStorage.setItem("userArea", addressInput);
    window.location.reload();
  };

  return (
    <>
      <nav className="bg-white border-b px-16 py-4 flex justify-between items-center sticky top-0 z-50">

        <div className="flex items-center gap-12">

          <h1
            onClick={() => navigate("/explore")}
            className="text-2xl font-bold text-[#fc8019] cursor-pointer"
          >
            Foody
          </h1>

          {userPhone && (
            <div
              onClick={() => setShowLocationBox(true)}
              className="cursor-pointer"
            >
              <p className="text-xs text-gray-500">Delivery to</p>
              <p className="font-semibold text-gray-800">
                {userArea || "Set location"}
              </p>
            </div>
          )}
        </div>

        {userPhone && (
          <div className="flex items-center gap-10 font-medium text-gray-700">

            <Link to="/explore">Explore</Link>
            <Link to="/user-dashboard">Orders</Link>
            <Link to="/profile">Profile</Link>

            <div
              onClick={() => navigate("/cart")}
              className="relative cursor-pointer"
            >
              🛒 Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-[#fc8019] text-white text-xs px-2 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>

            <button onClick={logout}>Logout</button>
          </div>
        )}
      </nav>

      {/* LOCATION POPUP */}
      {showLocationBox && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">Change location</h2>

            <input
              placeholder="Enter address"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="border w-full p-2 mb-3"
            />

            <button
              onClick={saveAddress}
              className="bg-[#fc8019] text-white w-full py-2 rounded mb-2"
            >
              Save address
            </button>

            <button
              onClick={detectLocation}
              className="border w-full py-2 rounded"
            >
              Detect my location
            </button>

            <button
              onClick={() => setShowLocationBox(false)}
              className="mt-3 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}