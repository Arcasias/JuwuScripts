import React from "react";
import { ScriptInfo } from "../scripts";
import { browser } from "./browser";

interface StorageScriptInfo {
  delay?: number;
  fileName: string;
  pattern: string | false;
}

export type ErrorCatcher<T> = [T, null] | [null, Error];
export type Replacer = (substring: string, ...args: any[]) => string;

export const canScriptRun = (
  script: ScriptInfo,
  tab: chrome.tabs.Tab | null
) => {
  if (!tab?.url) {
    return false;
  }
  const pattern = getPattern(script);
  return !pattern || pattern.test(tab.url);
};

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

export const choice = <T,>(list: T[]): T =>
  list[Math.floor(Math.random() * list.length)];

export const copyToClipboard = async (text?: string) =>
  catchAsyncError(async () => {
    if (!text) {
      throw new Error(`Could not copy script: the content is empty.`);
    }
    await navigator.clipboard.writeText(text);
  });

export const executeScript = async (
  script: ScriptInfo,
  force: boolean = false
) =>
  catchAsyncError(async () =>
    browser.runtime.sendMessage({
      func: "executeScripts",
      args: [[getStorageInfo(script)], force],
    })
  );

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

export const getClass = (
  ...classNames: (string | null | undefined | false)[]
) => classNames.filter(Boolean).join(" ");

export const getGithubURL = (...path: string[]) =>
  [GITHUB_URL, ...path].join("/");

export const getId = (script: ScriptInfo) =>
  [...script.path, script.fileName].join("/");

export const groupNameFromPath = (path: string[]) => path.slice(1).join(" / "); // Omit root path

export const getPattern = ({ directives }: ScriptInfo) => {
  let rePattern: RegExp | false = false;
  if (directives.pattern) {
    rePattern = directives.pattern;
  } else if (directives.website) {
    rePattern = new RegExp(
      directives.website.replaceAll(/[\\/.*+?[\](){}^$-]/g, "\\$&"),
      "i"
    );
  }
  return rePattern;
};

export const getStorageInfo = (script: ScriptInfo): StorageScriptInfo => {
  const {
    directives: { delay },
    fileName,
  } = script;
  const regexPattern = getPattern(script);
  const pattern = regexPattern && String(regexPattern);
  return { delay, fileName, pattern };
};

export const isIcon = (url?: string) => url && /bi-/.test(url);

export const isLocal = (path: string[]) => path.includes("local");

export const isURL = (url?: string) => url && /^https?:\/\//.test(url);

export const normalize = (str: string, condensed: boolean = false) =>
  str
    .toLowerCase()
    .normalize("NFKD")
    .replace(condensed ? /[^a-z0-9]/g : /[\u0300-\u036f]/g, "");

export const parseWebsite = (url?: string) => {
  if (!url) {
    return null;
  }
  const a = document.createElement("a");
  a.href = url;
  return a;
};

export const plural = (term: string, amount: number) => {
  if (term.endsWith("'")) {
    return term;
  }
  return amount === 1 ? term : term + "s";
};

export const caseReplacer = (target: string): Replacer => {
  return (match: string) => {
    const result = [];
    for (let i = 0; i < target.length; i++) {
      if (/[a-z]/.test(match[i])) {
        result.push(target[i].toLowerCase());
      } else if (/[A-Z]/.test(match[i])) {
        result.push(target[i].toUpperCase());
      } else {
        result.push(target[i]);
      }
    }
    return result.join("");
  };
};

export const storageGet = async (keys?: string | string[]) =>
  catchAsyncError(() => browser.storage.sync.get(keys));

export const storageRemove = async (keys: string | string[]) =>
  catchAsyncError(() => browser.storage.sync.remove(keys));

export const storageSet = async (values: Record<string, any>) =>
  catchAsyncError(() => browser.storage.sync.set(values));

// String constants
export const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";

// Other constants
const REPLACERS: [string, any][] = [
  ["`", "code"],
  ["**", "strong"],
  ["*", "em"],
];
