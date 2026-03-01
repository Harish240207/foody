import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserLogin() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [loginType, setLoginType] = useState("phone"); // phone or email

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [step, setStep] = useState("phone");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [address, setAddress] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  /* ---------------- LOCATION ---------------- */

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      setLat(latitude);
      setLng(longitude);

      try {
        const res = await axios.get(
          `http://localhost:5000/api/reverse-geocode?lat=${latitude}&lng=${longitude}`
        );
        setAddress(res.data.display);
      } catch {
        alert("Location fetch failed");
      }
    });
  };

  const searchAddress = async (text) => {
    setAddress(text);
    if (text.length < 3) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${text}&format=json`
    );
    const data = await res.json();
    setSuggestions(data.slice(0, 5));
  };

  const selectAddress = (place) => {
    setAddress(place.display_name);
    setLat(place.lat);
    setLng(place.lon);
    setSuggestions([]);
  };

  /* ---------------- PHONE OTP FLOW ---------------- */

  const sendOtp = () => {
    if (!phone) return alert("Enter phone number");

    const fakeOtp = Math.floor(1000 + Math.random() * 9000);
    setGeneratedOtp(fakeOtp);
    alert("Demo OTP: " + fakeOtp);

    setStep("otp");
  };

  const verifyOtp = async () => {
    if (otp !== generatedOtp.toString()) {
      return alert("Wrong OTP");
    }

    try {
      if (mode === "signup") {
        if (!name) return alert("Enter name");

        await axios.post("http://localhost:5000/api/user-signup", {
          name,
          phone,
          email: email || null,
          password: password || null,
          address: address || "",
          lat,
          lng,
        });

        if (address) localStorage.setItem("userArea", address);
      } else {
  const res = await axios.post(
    "http://localhost:5000/api/user-login",
    { phone }
  );

  // ✅ STORE FULL USER OBJECT (IMPORTANT)
  localStorage.setItem("user", JSON.stringify(res.data));

  if (res.data.address) {
    localStorage.setItem("userArea", res.data.address);
  }

  localStorage.setItem("userPhone", res.data.phone);
}

      localStorage.setItem("userPhone", phone);
      navigate("/explore");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  /* ---------------- EMAIL LOGIN ---------------- */

  const handleEmailLogin = async () => {
    if (!email || !password) {
      return alert("Enter email and password");
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/user-login",
        { email, password }
      );

      // ✅ STORE FULL USER OBJECT (IMPORTANT)
localStorage.setItem("user", JSON.stringify(res.data));

localStorage.setItem("userPhone", res.data.phone);

if (res.data.address) {
  localStorage.setItem("userArea", res.data.address);
}

      navigate("/explore");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-orange-50 to-white">

      {/* LEFT IMAGE */}
      <div className="hidden md:block">
        <img
          src="https://images.unsplash.com/photo-1498837167922-ddd27525d352"
          alt="food"
          className="h-full w-full object-cover"
        />
      </div>

      {/* FORM */}
      <div className="flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

          <h1
            onClick={() => navigate("/")}
            className="text-3xl font-bold text-primary mb-6 cursor-pointer text-center"
          >
            Foody
          </h1>

          {/* LOGIN / SIGNUP TOGGLE */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setStep("phone"); }}
              className={`flex-1 py-2 rounded-full ${
                mode === "login" ? "bg-primary text-white" : ""
              }`}
            >
              Login
            </button>

            <button
              onClick={() => { setMode("signup"); setStep("phone"); }}
              className={`flex-1 py-2 rounded-full ${
                mode === "signup" ? "bg-primary text-white" : ""
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* LOGIN TYPE TOGGLE */}
          {mode === "login" && (
            <div className="flex bg-gray-100 rounded-full p-1 mb-4">
              <button
                onClick={() => setLoginType("phone")}
                className={`flex-1 py-2 rounded-full ${
                  loginType === "phone" ? "bg-primary text-white" : ""
                }`}
              >
                Phone
              </button>
              <button
                onClick={() => setLoginType("email")}
                className={`flex-1 py-2 rounded-full ${
                  loginType === "email" ? "bg-primary text-white" : ""
                }`}
              >
                Email
              </button>
            </div>
          )}

          {mode === "signup" && (
  <>
    <input
      placeholder="Full Name"
      className="input-ui mb-3"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

    <input
      placeholder="Enter address"
      className="input-ui mb-2"
      value={address}
      onChange={(e) => searchAddress(e.target.value)}
    />

    <button
      onClick={detectLocation}
      className="w-full border border-primary text-primary rounded-lg py-2 mb-4"
    >
      📍 Detect My Location
    </button>

    <input
      placeholder="Email (optional)"
      className="input-ui mb-3"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      placeholder="Password (optional)"
      type="password"
      className="input-ui mb-3"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    {/* ✅ MANDATORY PHONE FIELD */}
    <input
      placeholder="Phone number *"
      className="input-ui mb-4"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
    />

    <button
      onClick={sendOtp}
      disabled={phone.length !== 10}
      className={`w-full py-3 rounded-lg font-semibold transition ${
        phone.length === 10
          ? "bg-primary text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      Send OTP
    </button>
  </>
)}

          {/* PHONE LOGIN */}
          {mode === "login" && loginType === "phone" && step === "phone" && (
            <>
              <input
                placeholder="Phone number"
                className="input-ui mb-4"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button
                onClick={sendOtp}
                className="w-full bg-primary text-white py-3 rounded-lg"
              >
                Send OTP
              </button>
            </>
          )}

          {/* EMAIL LOGIN */}
          {mode === "login" && loginType === "email" && (
            <>
              <input
                placeholder="Email"
                className="input-ui mb-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="input-ui mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                onClick={handleEmailLogin}
                className="w-full bg-primary text-white py-3 rounded-lg"
              >
                Login with Email
              </button>
            </>
          )}

          {/* OTP STEP */}
          {loginType === "phone" && step === "otp" && (
            <>
              <p className="mb-3 text-sm text-gray-600">
                Enter OTP sent to {phone}
              </p>

              <input
                className="input-ui mb-4"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                onClick={verifyOtp}
                className="w-full bg-primary text-white py-3 rounded-lg"
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