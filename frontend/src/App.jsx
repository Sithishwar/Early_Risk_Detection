import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import ZoneDetails from "./pages/ZoneDetails";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

/**
 * Root Application Component
 * - Owns routing
 * - Composes global layout
 * - Does NOT contain business logic
 */
export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/zone/:id" element={<ZoneDetails />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Footer />
    </>
  );
}
