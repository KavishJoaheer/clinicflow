import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "18px",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            background: "#f8fbff",
            color: "#0f172a",
            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
