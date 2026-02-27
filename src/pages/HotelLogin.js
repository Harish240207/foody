import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function HotelLogin() {

  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [location, setLocation] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [image, setImage] = useState(null);

  const [suggestions, setSuggestions] = useState([]);

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState("phone");

  // ================= DETECT LOCATION =================
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      setLat(latitude);
      setLng(longitude);

      try {
        const res = await axios.get(
          `http://localhost:5000/api/reverse-geocode?lat=${latitude}&lng=${longitude}`
        );

        setLocation(res.data.display || res.data.area);
      } catch {
        setLocation(`Lat ${latitude.toFixed(3)}, Lng ${longitude.toFixed(3)}`);
      }
    });
  };

  // ================= ADDRESS AUTOCOMPLETE =================
  const searchLocation = async (text) => {
    setLocation(text);

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          text
        )}&format=json&addressdetails=1&limit=5`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }

    } catch (err) {
      console.log("Autocomplete error:", err);
      setSuggestions([]);
    }
  };

  const selectLocation = (place) => {
    setLocation(place.display_name);
    setLat(parseFloat(place.lat));
    setLng(parseFloat(place.lon));
    setSuggestions([]);
  };

  // ================= SEND OTP =================
  const sendOtp = () => {
    if (!phone) return alert("Enter phone number");
    if (isSignup && !hotelName) return alert("Enter hotel name");

    const fakeOtp = Math.floor(1000 + Math.random() * 9000);
    setGeneratedOtp(fakeOtp);
    alert("Demo OTP: " + fakeOtp);

    setStep("otp");
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async () => {

    if (otp !== generatedOtp.toString()) return alert("Wrong OTP");

    try {
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("hotelName", hotelName);
      formData.append("location", location);
      formData.append("lat", lat || "");
      formData.append("lng", lng || "");

      if (image) {
        formData.append("image", image);
      }

      const res = await axios.post(
        "http://localhost:5000/api/hotel-login",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      localStorage.setItem("hotelPhone", phone);

      if (res.data?.hotelName) {
        localStorage.setItem("hotelName", res.data.hotelName);
      }

      navigate("/hotel-dashboard");

    } catch (err) {
      console.log(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md">

        <h1
          onClick={() => navigate("/")}
          className="text-3xl font-bold text-[#fc8019] mb-8 text-center cursor-pointer"
        >
          Foody Partner
        </h1>

        <div className="border rounded-2xl p-8 shadow-lg">

          {/* LOGIN / SIGNUP SWITCH */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => { setIsSignup(false); setStep("phone"); }}
              className={`px-4 py-2 rounded font-medium ${
                !isSignup ? "bg-[#fc8019] text-white" : "bg-gray-200"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => { setIsSignup(true); setStep("phone"); }}
              className={`px-4 py-2 rounded font-medium ${
                isSignup ? "bg-[#fc8019] text-white" : "bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* ================= PHONE STEP ================= */}
          {step === "phone" && (
            <>
              <input
                placeholder="Phone number"
                className="w-full p-3 border rounded mb-4"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />

              {isSignup && (
                <>
                  <input
                    placeholder="Hotel Name"
                    className="w-full p-3 border rounded mb-4"
                    value={hotelName}
                    onChange={e => setHotelName(e.target.value)}
                  />

                  {/* LOCATION WITH AUTOCOMPLETE */}
                  <div className="relative mb-4">
                    <div className="flex gap-2">
                      <input
                        placeholder="Hotel Location"
                        className="w-full p-3 border rounded"
                        value={location}
                        onChange={e => searchLocation(e.target.value)}
                      />

                      <button
                        type="button"
                        onClick={detectLocation}
                        className="bg-gray-200 px-4 rounded"
                      >
                        📍
                      </button>
                    </div>

                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 z-50 bg-white border w-full max-h-40 overflow-y-auto rounded shadow">
                        {suggestions.map((s, i) => (
                          <div
                            key={i}
                            onClick={() => selectLocation(s)}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {s.display_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* HOTEL IMAGE */}
                  <input
                    type="file"
                    onChange={e => setImage(e.target.files[0])}
                    className="mb-4"
                  />
                </>
              )}

              <button
                onClick={sendOtp}
                className="w-full bg-[#fc8019] text-white py-3 rounded font-semibold"
              >
                Send OTP
              </button>
            </>
          )}

          {/* ================= OTP STEP ================= */}
          {step === "otp" && (
            <>
              <input
                placeholder="Enter OTP"
                className="w-full p-3 border rounded mb-4"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />

              <button
                onClick={verifyOtp}
                className="w-full bg-[#fc8019] text-white py-3 rounded font-semibold"
              >
                Verify & Continue
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}