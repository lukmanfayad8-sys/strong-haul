import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AuthProvider from "./context/AuthProvider.jsx";
import App from "./App.jsx";
import BrowseTrucks from "./pages/BrowseTrucks.jsx";
import Auth from "./pages/Auth.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";
import Subscription from "./pages/Subscription.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/browse" element={<BrowseTrucks />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><OwnerDashboard /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute><AdminPanel /></ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);