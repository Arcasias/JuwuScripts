import React from "react";

export type ErrorCatcher<T> = [T, null] | [null, Error];
export type Exports = Record<string, "function" | "object">;

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
    const [tab] = await tabs.query({
      active: true,
      currentWindow: true,
    });
    await scripting.executeScript({
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
  catchAsyncError<Record<string, any>>(() => storage.sync.get(...keys));

export const storageRemove = async (...keys: string[]) =>
  catchAsyncError(() => storage.sync.remove(...keys));

export const storageSet = async (values: Record<string, any>) =>
  catchAsyncError(() => storage.sync.set(values));

const REPLACERS: [string, any][] = [
  ["`", "code"],
  ["**", "strong"],
  ["*", "em"],
];

// String constants
export const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";
export const SCRIPTS_PATH = "./scripts/";
export const LIST_ITEM_CLASS = "list-group-item text-bg-dark";

// Service keys
const { scripting, storage, tabs } =
  (window as any).browser || (window as any).chrome;
