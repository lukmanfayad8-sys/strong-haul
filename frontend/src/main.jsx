import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import BrowseTrucks from "./pages/BrowseTrucks.jsx";
import Auth from "./pages/Auth.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/browse" element={<BrowseTrucks />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
    </BrowserRouter>
  </StrictMode>
);