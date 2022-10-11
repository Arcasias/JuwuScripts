import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { minify } from "uglify-js";

interface Directives {
  description?: string;
  use?: string;
  autorun: boolean;
  run: "clipboard" | boolean;
  website?: string;
  wrapper: "iife" | "observer" | false;
}

interface WrapperOptions {
  async?: boolean;
}

type Directive = keyof Directives;
type Exports = Record<string, "function" | "object">;

export interface ScriptInfo {
  content: string;
  directives: Directives;
  ext: string;
  fileName: string;
  id: string;
  minContent: string;
  minFileName: string;
  title: string;
  url: string;
}

const PUBLIC_FOLDER = "src/public";
const LOCAL_FOLDER = "src/local";
const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";

const SCRIPT_EXTS = ["js", "ts"];

const COMMENT_START = /\/\*\*/;
const COMMENT_LINE = /^\s*\*/;
const COMMENT_END = /\*\//;
const DIRECTIVE = /@(\w+)\s+(.*)/;

// Helpers
const isFalse = (expr: string) =>
  /^(no|none|false|null|undefined|0)$/i.test(expr);

const isSupported = (fileName: string) => /.(js|ts|html|s?css)$/.test(fileName);

const isTrue = (expr: string) => /^(yes|true|1)$/i.test(expr);

const filterEmpty = (line?: string) =>
  line?.length && !/^[\s\r\n]+$/.test(line);

const cleanLine = (line: string) => line.replaceAll(/[\r\n]+/g, "");

const readScript = async (folder: string, fileName: string) => {
  const url =
    folder === PUBLIC_FOLDER
      ? [GITHUB_URL, PUBLIC_FOLDER, fileName].join("/")
      : "";
  const scriptContent = await readFile(join(folder, fileName), "utf8");
  const lines = scriptContent.split("\n");
  const fileNameParts = fileName.split(".");
  const ext = fileNameParts.pop()!;
  const minFileName = [...fileNameParts, "min", ext].join(".");
  const title: string[] = [];
  const directives: Directives = {
    autorun: true,
    run: true,
    wrapper: "iife",
  };

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
          const dirName = name.trim() as Directive;
          let dirValue: string | boolean = content.trim();
          if (isFalse(dirValue)) {
            dirValue = false;
          } else if (isTrue(dirValue)) {
            dirValue = true;
          }
          (<any>directives)[dirName] = dirValue;
        } else {
          title.push(trimmed);
        }
      } else if (COMMENT_START.test(line)) {
        started = true;
      }
    }
  }

  let content = lines
    .slice(startingLine)
    .filter(filterEmpty)
    .map(cleanLine)
    .join("\n");

  // Wrap content
  const wrapperOptions = {
    async: /\bawait\b/.test(content), // Naive check -- better safe than sorry
  };
  switch (directives.wrapper) {
    case "iife": {
      content = wrapInIIFE(content, wrapperOptions);
      break;
    }
    case "observer": {
      content = wrapInObserver(content, wrapperOptions);
      break;
    }
  }

  // Extract exports
  const exports: Exports = {};
  content = content.replaceAll(
    /\bexport\s+(const|let|var|function)\s+([\w-]+)?\s*=?\s*(\()?/g,
    (_, keyword, exportedTerm, parenthesis) => {
      const isFunction = parenthesis || keyword === "function";
      exports[exportedTerm] = isFunction ? "function" : "object";
      return `window.${exportedTerm} = ${
        keyword === "function" ? "function " : ""
      }${parenthesis || ""}`;
    }
  );

  // Minify content
  console.log("Minifying file:", fileName);
  const result = minify(content, { warnings: "verbose" });
  if (result.error) {
    console.error(`> ERROR (skipping script): ->`, result.error, "\n");
  } else if (result.warnings) {
    console.warn(result.warnings.map((w) => `> ${w}`).join("\n"), "\n");
  } else {
    console.log("> SUCCESS\n");
  }

  return {
    content,
    directives,
    ext,
    exports,
    fileName,
    id: fileNameParts.join(".").replace(/_/, "-"),
    minContent: result.code,
    minFileName,
    title: title.filter(filterEmpty).join(" "),
    url,
  };
};

const readScripts = async (folder: string) => {
  const scriptNames = await readdir(folder);
  return Promise.all(
    scriptNames.filter(isSupported).map((fname) => readScript(folder, fname))
  );
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

const wrapInFE = (code: string, options: WrapperOptions = {}) => /* js */ `${
  options.async ? "async " : ""
}() => {
${code}
}`;

const wrapInIIFE = (
  code: string,
  options?: WrapperOptions
) => /* js */ `/* iife wrapper */
(${wrapInFE(code, options)})();
`;

const wrapInObserver = (code: string, options?: WrapperOptions) =>
  wrapInIIFE(
    /* js */ `/* observer wrapper */
  const observerCallback = ${wrapInFE(code, options)};
  new MutationObserver(observerCallback).observe(document.body, { childList:true, subtree:true });
  observerCallback();`,
    { async: false }
  );

export const getScriptInfos = async () => {
  const scriptInfo = await Promise.all([
    readScripts(PUBLIC_FOLDER),
    readScripts(LOCAL_FOLDER),
  ]);
  return scriptInfo
    .flat()
    .sort((a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0));
};

// Script builders
export const buildJsScript = (info: ScriptInfo) => {
  const relevantInfo: Partial<ScriptInfo> = { ...info };
  delete relevantInfo.content;
  if (relevantInfo.directives!.run !== "clipboard") {
    delete relevantInfo.minContent;
  }
  return serialize(relevantInfo);
};

// Index builders
export const buildMdIndexEntry = ({ title, url }: ScriptInfo) =>
  `- [${title}](${url})`;

// Comment builders
export const jsComment = (comment: string) => `/* ${comment} */`;
export const htmlComment = (comment: string) => `<!-- ${comment} -->`;
export const mdComment = htmlComment;
