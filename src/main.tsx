import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { registerPwaWorker } from "./pwa";
import "./styles.css";
import "./ui/layout.css";

registerPwaWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
