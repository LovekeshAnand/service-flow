import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AlertProvider } from "./components/AlertProvider"; // Import AlertProvider

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AlertProvider> {/* ✅ Wrap App with AlertProvider */}
      <App />
    </AlertProvider>
  </StrictMode>
);
