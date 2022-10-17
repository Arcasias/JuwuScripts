import React, { createContext, useEffect, useState } from "react";
import { browser } from "../utils/browser";
import { catchAsyncError } from "../utils/utils";

export const TabProvider = ({ children }: React.PropsWithChildren) => {
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null);

  // Get current or default theme
  useEffect(() => {
    const fetchTab = async () => {
      const [tabs, error] = await catchAsyncError(() =>
        browser.tabs.query({
          active: true,
          currentWindow: true,
        })
      );
      if (error) {
        console.debug(error);
      } else {
        setTab(tabs[0]);
      }
    };
    fetchTab();
  }, []);

  return <TabContext.Provider value={tab}>{children}</TabContext.Provider>;
};

export const TabContext = createContext<chrome.tabs.Tab | null>(null);
