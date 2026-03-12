import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

console.log("App starting...");

try {
  createRoot(root).render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error rendering app:", error);
  root.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error.message}</div>`;
}
