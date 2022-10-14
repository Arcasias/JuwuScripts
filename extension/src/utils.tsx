import React, { useState } from "react";
import { browser } from "./browser";

export interface ThemeState {
  theme: Theme;
}

export interface ThemeStateActions {
  getThemeClass: (...classNames: any[]) => string;
  isTheme: (theme: Theme) => boolean;
  setTheme: (theme: Theme) => void;
}

export type ErrorCatcher<T> = [T, null] | [null, Error];
export type Exports = Record<string, "function" | "object">;
export type Theme = "dark" | "light";

export const catchAsyncError = async <T = true,>(
  fn: (...args: any[]) => Promise<T>
): Promise<ErrorCatcher<T>> => {
  try {
    const result = await fn();
    return [result || true, null] as any;
  } catch (err) {
    return [null, err as Error];
  }
};

export const catchError = <T,>(fn: (...args: any[]) => T): ErrorCatcher<T> => {
  try {
    const result = fn();
    return [result, null];
  } catch (err) {
    return [null, err as Error];
  }
};

export const copyToClipboard = async (text?: string) =>
  catchAsyncError(async () => {
    if (!text) {
      throw new Error(`Could not copy script: the content is empty.`);
    }
    await navigator.clipboard.writeText(text);
  });

export const executeScript = async (fileName: string) =>
  catchAsyncError(async () => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: [SCRIPTS_PATH + fileName],
      world: "MAIN",
    });
  });

export const formatText = (text: string, replacers = [...REPLACERS]) => {
  const [marker, TagName] = replacers.shift()!;
  const parts: any[] = text.split(marker);
  for (let i = 0; i < parts.length; i++) {
    const value = replacers.length
      ? formatText(parts[i] as string, [...replacers])
      : parts[i];
    parts[i] = i > 0 && i % 2 ? <TagName key={i}>{value}</TagName> : value;
  }
  return parts;
};

export const getClass = (...classNames: any[]) =>
  classNames.filter(Boolean).join(" ");

export const getDefaultTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const getGithubURL = (...path: string[]) =>
  [GITHUB_URL, ...path].join("/");

export const groupNameFromPath = (path: string[]) => path.slice(1).join("/"); // Omit root path

export const getWebsiteHostname = (url: string) => {
  const a = document.createElement("a");
  a.href = url;
  return a.hostname;
};

export const isLocal = (path: string[]) => path.includes("local");

export const isURL = (url: string) => /^https?:\/\//.test(url);

export const normalize = (str: string, condensed: boolean = false) =>
  str
    .toLowerCase()
    .normalize("NFKD")
    .replace(condensed ? /[^a-z0-9]/g : /[\u0300-\u036f]/g, "");

export const storageGet = async (...keys: string[]) =>
  catchAsyncError<Record<string, any>>(() => browser.storage.sync.get(...keys));

export const storageRemove = async (...keys: string[]) =>
  catchAsyncError(() => browser.storage.sync.remove(...keys));

export const storageSet = async (values: Record<string, any>) =>
  catchAsyncError(() => browser.storage.sync.set(values));

const REPLACERS: [string, any][] = [
  ["`", "code"],
  ["**", "strong"],
  ["*", "em"],
];

// String constants
export const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";
export const SCRIPTS_PATH = "./scripts/";
export const THEME_STORAGE_KEY = "[THEME]";

// ThemeState
const themeState: ThemeState = { theme: getDefaultTheme() };
const themeSetStates: React.Dispatch<React.SetStateAction<ThemeState>>[] = [];
export const useTheme = (): ThemeStateActions => {
  const [state, setState] = useState(themeState);
  themeSetStates.push(setState);
  return {
    getThemeClass: (...classNames: string[]) =>
      getClass(...classNames, state.theme === "dark" && "text-bg-dark"),
    isTheme(theme) {
      return theme === state.theme;
    },
    setTheme: (theme) => {
      if (theme === state.theme) {
        return;
      }
      theme ||= getDefaultTheme();
      themeState.theme = theme;
      document.body.className = theme + "-theme";
      for (const setState of themeSetStates) {
        setState({ theme });
      }
      storageSet({ [THEME_STORAGE_KEY]: theme });
    },
  };
};
