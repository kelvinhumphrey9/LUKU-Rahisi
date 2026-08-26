import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.info("Initializing Tanzania Electricity Purchase App (Web Client)...");

const container = document.getElementById("root");
if (container) {
  console.log("Root element found, rendering React tree.");
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error("Root element 'root' not found in document.");
}
