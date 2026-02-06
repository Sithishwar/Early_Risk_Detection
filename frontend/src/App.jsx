import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import ZoneDetails from "./pages/ZoneDetails";
import Login from "./pages/Login";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/**
 * Root Application Component
 * - Owns routing
 * - Composes global layout
 * - Does NOT contain business logic
 */
export default function App() {
  const isAuthenticated = true; // Replace with real auth later

  return (
    <>
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="/alerts"
          element={isAuthenticated ? <Alerts /> : <Navigate to="/" replace />}
        />

        <Route
          path="/zone/:id"
          element={
            isAuthenticated ? <ZoneDetails /> : <Navigate to="/" replace />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {isAuthenticated && <Footer />}
    </>
  );
}
