import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/App";
import { TabProvider } from "./providers/TabProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

import "./style.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TabProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </TabProvider>
  </StrictMode>
);
