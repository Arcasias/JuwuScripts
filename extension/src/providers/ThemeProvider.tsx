import React, { createContext, useEffect, useMemo, useState } from "react";
import { storageGet, storageSet } from "../utils/utils";

interface ThemeActions {
  readonly current: Theme;
  readonly className: string | false;
  is(theme: Theme): boolean;
  toggle(): void;
}

type Theme = "dark" | "light";

const getDefaultTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const makeThemeActions = (
  theme: Theme,
  setTheme: React.Dispatch<React.SetStateAction<Theme>>
): ThemeActions => ({
  get current() {
    return theme;
  },
  get className() {
    return theme !== "light" && `text-bg-${theme}`;
  },
  is: (comparison) => theme === comparison,
  toggle: () =>
    setTheme(AVAILABLE_THEMES.at(AVAILABLE_THEMES.indexOf(theme) - 1)!),
});

export const ThemeProvider = ({ children }: React.PropsWithChildren) => {
  const [theme, setTheme] = useState(defaultTheme);
  const themeActions: ThemeActions = useMemo(
    () => makeThemeActions(theme, setTheme),
    [theme]
  );

  // Update storage & body class name on theme update.
  useEffect(() => {
    document.body.className = `${theme}-theme`;
    if (storageTheme !== theme) {
      storageTheme = theme;
      storageSet({ [THEME_STORAGE_KEY]: theme });
    }
  }, [theme]);

  // Get current or default theme
  useEffect(() => {
    const fetchTheme = async () => {
      const [result, error] = await storageGet(THEME_STORAGE_KEY);
      if (error) {
        console.debug(error);
      } else if (result[THEME_STORAGE_KEY]) {
        setTheme(result[THEME_STORAGE_KEY]);
      }
    };
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={themeActions}>
      {children}
    </ThemeContext.Provider>
  );
};

const AVAILABLE_THEMES: Theme[] = ["dark", "light"];
const THEME_STORAGE_KEY = "[THEME]";

const defaultTheme = getDefaultTheme();
let storageTheme: string = defaultTheme;

export const ThemeContext = createContext<ThemeActions>(
  makeThemeActions(defaultTheme, () => {})
);
