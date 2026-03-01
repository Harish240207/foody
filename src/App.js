import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import LoginSelect from "./pages/LoginSelect";
import UserLogin from "./pages/UserLogin";
import HotelLogin from "./pages/HotelLogin";
import HotelDashboard from "./pages/HotelDashboard";
import Explore from "./pages/Explore";
import UserDashboard from "./pages/UserDashboard";
import NGODashboard from "./pages/NGODashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TrackOrder from "./pages/TrackOrder";
import CartPage from "./components/CartPage";
import HotelMenu from "./pages/HotelMenu";
import Profile from "./pages/Profile";
import OrderTracking from "./pages/OrderTracking";
import AdminComplaints from "./pages/AdminComplaints";






// ============================================
// 🔐 PROTECTED ROUTE
// ============================================

const ProtectedRoute = ({ children, type }) => {
  const user = localStorage.getItem("userPhone");
  const hotel = localStorage.getItem("hotelPhone");
  const admin = localStorage.getItem("adminAuth");
  const ngo = localStorage.getItem("ngoAuth");

  if (type === "user" && !user)
    return <Navigate to="/user-login" replace />;

  if (type === "hotel" && !hotel)
    return <Navigate to="/hotel-login" replace />;

  if (type === "admin" && !admin)
    return <Navigate to="/" replace />;

  if (type === "ngo" && !ngo)
    return <Navigate to="/" replace />;

  return children;
};


// ============================================
// 🔥 SMOOTH PAGE WRAPPER (Apple style)
// ============================================

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.35,
        ease: [0.4, 0, 0.2, 1] // smooth cubic-bezier
      }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
};


// ============================================
// 🔄 AUTO SCROLL TO TOP ON ROUTE CHANGE
// ============================================

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [location.pathname]);

  return null;
};


// ============================================
// 🎬 ROUTES WITH ANIMATION
// ============================================

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* PUBLIC ROUTES */}
          <Route
            path="/"
            element={<PageWrapper><LoginSelect /></PageWrapper>}
          />

          <Route
            path="/user-login"
            element={<PageWrapper><UserLogin /></PageWrapper>}
          />

          <Route
            path="/hotel-login"
            element={<PageWrapper><HotelLogin /></PageWrapper>}
          />


          {/* USER ROUTES */}
          <Route
            path="/explore"
            element={
              <ProtectedRoute type="user">
                <PageWrapper><Explore /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hotel/:hotelId"
            element={
              <ProtectedRoute type="user">
                <PageWrapper><HotelMenu /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute type="user">
                <PageWrapper><UserDashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cart"
            element={
              <ProtectedRoute type="user">
                <PageWrapper><CartPage /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute type="user">
                <PageWrapper><Profile /></PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route
            path="/track/:orderId"
            element={
              <ProtectedRoute type="user">
                <PageWrapper><OrderTracking /></PageWrapper>
              </ProtectedRoute>
            }
          />


          {/* HOTEL ROUTES */}
          <Route
            path="/hotel-dashboard"
            element={
              <ProtectedRoute type="hotel">
                <PageWrapper><HotelDashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />


          {/* NGO ROUTE (Protected) */}
          <Route
            path="/ngo-dashboard"
            element={
              <ProtectedRoute type="ngo">
                <PageWrapper><NGODashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />


          {/* ADMIN ROUTE */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute type="admin">
                <PageWrapper><AdminDashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />


          {/* TRACK ORDER (Optional public if needed) */}
          <Route
            path="/track-order"
            element={<PageWrapper><TrackOrder /></PageWrapper>}
          />


          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/admin-complaints" element={<AdminComplaints />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          

        </Routes>
      </AnimatePresence>
    </>
  );
}


// ============================================
// 🚀 APP ROOT
// ============================================

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;