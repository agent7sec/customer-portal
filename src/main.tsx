import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@refinedev/antd/dist/reset.css";
import "./styles/accessibility.css";
import { register as registerServiceWorker } from "./utils/serviceWorkerRegistration";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for asset caching in production
registerServiceWorker();
