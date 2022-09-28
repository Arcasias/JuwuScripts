import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { minify } from "uglify-js";

interface Directives {
  description?: string;
  result?: string[];
  use?: string;
  website?: string;
  wrapper: WrapMode;
}

interface WrapperOptions {
  async?: boolean;
}

type Directive = keyof Directives;
type WrapMode = "iife" | "observer" | "none";

export interface ScriptInfo {
  content: string;
  directives: Directives;
  ext: string;
  fileName: string;
  id: string;
  title: string;
  url: string;
}

const SRC_FOLDER = "src/public";
const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";

const SCRIPT_EXTS = ["js", "ts"];

const COMMENT_START = /\/\*\*/;
const COMMENT_LINE = /^\s*\*/;
const COMMENT_END = /\*\//;
const DIRECTIVE = /@(\w+)\s+(.*)/;

// Helpers
const isSupported = (fileName: string) => /.(js|ts|html|s?css)$/.test(fileName);

const filterEmpty = (line?: string) =>
  line?.length && !/^[\s\r\n]+$/.test(line);

const cleanLine = (line: string) => line.replaceAll(/[\r\n]+/g, "");

const readScript = async (fileName: string) => {
  const scriptContent = await readFile(join(SRC_FOLDER, fileName), "utf8");
  const lines = scriptContent.split("\n");
  const fileNameParts = fileName.split(".");
  const ext = fileNameParts.pop()!;
  const title: string[] = [];
  const directives: Directives = { wrapper: "iife" };

  let startingLine: number = 0;

  // Script
  if (SCRIPT_EXTS.includes(ext)) {
    let started = false;
    for (startingLine = 0; startingLine < lines.length; startingLine++) {
      const line = lines[startingLine]!;
      if (started) {
        if (COMMENT_END.test(line)) {
          startingLine++;
          break;
        }
        const trimmed = line.replace(COMMENT_LINE, "").trim();
        const directiveMatch = trimmed.match(DIRECTIVE);
        if (directiveMatch) {
          const [, name, content] = directiveMatch;
          const directive = name.trim() as Directive;
          const trimmed = content.trim();
          if (directive === "result") {
            directives[directive] = trimmed
              .split(/[&,]/)
              .map((x: string) => x.trim());
          } else if (directive === "wrapper") {
            directives[directive] = trimmed as WrapMode;
          } else {
            directives[directive] = trimmed;
          }
        } else {
          title.push(trimmed);
        }
      } else if (COMMENT_START.test(line)) {
        started = true;
      }
    }
  }

  console.log("Minifying file:", fileName);
  let content = lines
    .slice(startingLine)
    .filter(filterEmpty)
    .map(cleanLine)
    .join("\n");
  const mayBeAsync = /\bawait\b/.test(content); // Naive check -- better safe than sorry
  switch (directives.wrapper) {
    case "iife": {
      content = wrapInIIFE(content, { async: mayBeAsync });
      break;
    }
    case "observer": {
      content = wrapInObserver(content, { async: mayBeAsync });
      break;
    }
  }
  const result = minify(content, { warnings: "verbose" });
  if (result.error) {
    console.error(`> ERROR (skipping script): ->`, result.error, "\n");
  } else if (result.warnings) {
    console.warn(result.warnings.map((w) => `> ${w}`).join("\n"), "\n");
  } else {
    console.log("> SUCCESS\n");
  }

  return {
    content: result.code,
    directives: directives as Record<Directive, any>,
    ext,
    fileName,
    id: fileNameParts.join(".").replace(/_/, "-"),
    title: title.filter(filterEmpty).join(" "),
    url: [GITHUB_URL, SRC_FOLDER, fileName].join("/"),
  };
};

const serialize = (value: any): string => {
  if (Array.isArray(value)) {
    return `[${value.map(serialize).join(",")}]`;
  } else if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .map(([k, v]) => `"${k}":${serialize(v)}`)
      .join(",")}}`;
  } else if (typeof value === "string") {
    return `\`${value.replace(/(`|\$|\\)/g, "\\$1")}\``;
  } else {
    return String(value);
  }
};

const wrapInFE = (code: string, options: WrapperOptions = {}) =>
  /* js */ `${options.async ? "async" : ""}()=>{${code}}`;

const wrapInIIFE = (code: string, options?: WrapperOptions) =>
  /* js */ `(${wrapInFE(code, options)})();`;

const wrapInObserver = (code: string, options?: WrapperOptions) =>
  wrapInIIFE(
    /* js */ `let callback=${wrapInFE(
      code,
      options
    )};new MutationObserver(callback).observe(document.body,{childList:true,subtree:true});callback();`,
    { async: false }
  );

export const getScriptInfos = async () => {
  const scriptFileNames = await readdir(SRC_FOLDER);
  const filteredNames = scriptFileNames.filter(isSupported);
  const scriptInfo = await Promise.all(filteredNames.map(readScript));
  return scriptInfo.sort((a, b) =>
    a.title > b.title ? 1 : a.title < b.title ? -1 : 0
  );
};

// Script builders
export const buildJsScript = (info: ScriptInfo) => serialize(info);

// Index builders
export const buildMdIndexEntry = ({ title, url }: ScriptInfo) =>
  `- [${title}](${url})`;

// Comment builders
export const jsComment = (comment: string) => `/* ${comment} */`;
export const htmlComment = (comment: string) => `<!-- ${comment} -->`;
export const mdComment = htmlComment;
