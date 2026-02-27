import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function LoginSelect() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const cardRef = useRef(null);
  const lightRef = useRef(null);

  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  // ================= REAL 3D TILT =================
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 22;
    const rotateX = -((y - centerY) / centerY) * 22;

    setRotate({ x: rotateX, y: rotateY });

    // dynamic light follow
    if (lightRef.current) {
      lightRef.current.style.background = `
        radial-gradient(circle at ${x}px ${y}px,
        rgba(255,255,255,0.45),
        transparent 60%)
      `;
    }
  };

  const resetTilt = () => {
    setRotate({ x: 0, y: 0 });
    if (lightRef.current) {
      lightRef.current.style.background =
        "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent 60%)";
    }
  };

  // ================= MAGNETIC BUTTON =================
  const MagneticButton = ({ children, onClick, className }) => {
    const ref = useRef();

    const handleMove = (e) => {
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      ref.current.style.transform = `translate(${x * 0.3}px, ${
        y * 0.3
      }px)`;
    };

    const reset = () => {
      ref.current.style.transform = "translate(0px,0px)";
    };

    return (
      <button
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        onClick={onClick}
        className={`transition-transform duration-200 ${className}`}
      >
        {children}
      </button>
    );
  };

  // ================= LOCATION =================
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Location not supported");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      localStorage.setItem("lat", lat);
      localStorage.setItem("lng", lng);

      try {
        const res = await axios.get(
          `http://localhost:5000/api/reverse-geocode?lat=${lat}&lng=${lng}`
        );

        const place = res.data.display;
        const area = res.data.area;

        setLocation(place);
        localStorage.setItem("userLocation", place);
        localStorage.setItem("userArea", area);
      } catch {
        const fallback = `Lat ${lat.toFixed(3)}, Lng ${lng.toFixed(3)}`;
        setLocation(fallback);
        localStorage.setItem("userLocation", fallback);
      }

      setLoadingLocation(false);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="relative min-h-screen bgSoft overflow-hidden"
    >

      {/* FLOATING SOFT BLOBS */}
      <motion.div
        animate={{ y: [0, -40, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-[450px] h-[450px] bg-orange-400/20 blur-3xl rounded-full top-[-120px] left-[-120px]"
      />
      <motion.div
        animate={{ y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute w-[350px] h-[350px] bg-orange-500/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]"
      />

      {/* NAVBAR */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1
            onClick={() => navigate("/")}
            className="text-3xl font-bold text-primary cursor-pointer"
          >
            Foody
          </h1>

          <div className="flex gap-6 items-center">
            <MagneticButton
              onClick={() => navigate("/hotel-login")}
              className="text-gray-700 hover:text-primary font-medium"
            >
              Partner with us
            </MagneticButton>

            <MagneticButton
              onClick={() => navigate("/user-login")}
              className="btn-primary"
            >
              Sign In
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="page-container">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[80vh]">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <h1 className="text-5xl font-bold leading-tight text-gray-900">
              Discover surplus meals near you
            </h1>

            <p className="text-gray-600 mt-6 text-lg">
              Affordable food. Less waste. Better planet.
            </p>

            <div className="mt-10 flex shadow-xl rounded-full overflow-hidden bg-white">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter delivery location"
                className="flex-1 px-6 py-4 outline-none"
              />

              <MagneticButton
                onClick={detectLocation}
                className="px-6 bg-gray-100"
              >
                {loadingLocation ? "..." : "📍"}
              </MagneticButton>

              <MagneticButton
                onClick={() => {
                  if (!location) {
                    alert("Enter location first");
                    return;
                  }
                  localStorage.setItem("userLocation", location);
                  navigate("/user-login");
                }}
                className="bg-primary px-8 text-white font-semibold"
              >
                FIND FOOD
              </MagneticButton>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              🍱 120+ hotels partnered • ♻️ 3,000+ meals saved
            </p>
          </motion.div>

          {/* RIGHT 3D CARD */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="hidden md:flex justify-center items-center"
            style={{ perspective: "2000px" }}
          >
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetTilt}
              className="relative w-[420px] h-[520px] bg-white rounded-3xl shadow-2xl p-6 transition-all duration-200"
              style={{
                transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                transformStyle: "preserve-3d"
              }}
            >

              {/* LIGHT EFFECT */}
              <div
                ref={lightRef}
                className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-200"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent 60%)"
                }}
              />

              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
                alt="food"
                className="rounded-2xl h-72 w-full object-cover"
                style={{ transform: "translateZ(60px)" }}
              />

              <div
                className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg"
                style={{ transform: "translateZ(80px)" }}
              >
                50% OFF
              </div>

              <div className="mt-6" style={{ transform: "translateZ(70px)" }}>
                <h2 className="text-2xl font-bold text-gray-900">
                  Surplus Veg Meal
                </h2>

                <p className="text-gray-500 mt-2">
                  Fresh. Affordable. Sustainable.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <span className="line-through text-gray-400">₹199</span>
                  <span className="text-orange-600 text-xl font-bold">
                    ₹99
                  </span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}