import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { FONT_IMPORT } from "./lib/constants.js";

const style = document.createElement("style");
style.textContent = FONT_IMPORT;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
