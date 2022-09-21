import React from "react";
import ReactDOM from "react-dom/client";
import { Popup } from "./Popup";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);

// Disgusting hack to make the root take its actual width
root.setAttribute("style", "width:0px");
setTimeout(() => root.removeAttribute("style"));
