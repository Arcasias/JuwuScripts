import { existsSync } from "fs";
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
  requires?: string;
  group?: string;
  ignore?: boolean;
}

interface WrapperOptions {
  async?: boolean;
}

type Directive = keyof Directives;
type Exports = Record<string, "function" | "object">;

export interface ScriptInfo {
  directives: Directives;
  ext: string;
  fileName: string;
  id: string;
  content: string;
  title: string;
  url: string;
}

const PUBLIC_FOLDER = "src/public";
const LOCAL_FOLDER = "src/local";
const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";

const COMMENT_START = /^\s*\/\*/;
const COMMENT_LINE = /^\s*\*/;
const COMMENT_END = /\*\/\s*$/;
const DIRECTIVE = /@([\w-]+)(.*)?/;

// Helpers
const camelTo = (string: string, glue: string) =>
  string.replaceAll(/([a-z])([A-Z])/g, (_, a, b) => a + glue + b.toLowerCase());

const isFalse = (expr: string) =>
  /^(no|none|false|null|undefined|0)$/i.test(expr);

const isSupported = (fileName: string) => /.(js|ts)$/.test(fileName);

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
  const title: string[] = [];
  const directives: Directives = {
    autorun: true,
    run: true,
    wrapper: "iife",
  };

  let startingLine: number = 0;

  // Script
  let commentFound = false;
  for (startingLine = 0; startingLine < lines.length; startingLine++) {
    const line = lines[startingLine]!;
    if (commentFound) {
      if (COMMENT_END.test(line)) {
        startingLine++;
        break;
      }
      const trimmed = line.replace(COMMENT_LINE, "").trim();
      const directiveMatch = trimmed.match(DIRECTIVE);
      if (directiveMatch) {
        const [, name, content] = directiveMatch;
        const dirName = name.trim() as Directive;
        let dirValue: string | boolean = (content || "").trim();
        if (isFalse(dirValue)) {
          dirValue = false;
        } else if (!dirValue.length || isTrue(dirValue)) {
          dirValue = true;
        }
        (<any>directives)[dirName] = dirValue;
      } else {
        title.push(trimmed);
      }
    } else if (COMMENT_START.test(line)) {
      commentFound = true;
    }
  }
  if (!commentFound) {
    startingLine = 0;
  }

  // Default
  if (!title.length) {
    title.push(capitalize(camelTo(snakeTo(fileNameParts.join(" "), " "), " ")));
  }

  let content = lines
    .slice(startingLine)
    .filter(filterEmpty)
    .map(cleanLine)
    .join("\n");

  // Add requirements
  if (directives.requires) {
    const reqs = directives.requires.split(".").map((r) => `["${r}"]`);
    content = [`if (!window${reqs.join("")}) return;`, content].join("\n");
  }

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

  let processedContent: string;
  if (process.env.DEBUG === "true") {
    processedContent = content;
  } else {
    // Reduce XML string templates
    content = content
      .replaceAll(/`[\n\s\t]+/gm, "`")
      .replaceAll(/[\n\s\t]+`/gm, "`")
      .replaceAll(/>[\n\s\t]+/gm, ">")
      .replaceAll(/[\n\s\t]+<\//gm, "</");

    // Minify content
    console.log("Minifying file:", fileName);
    const result = minify(content, {
      warnings: "verbose",
      // Chrome seems to be a bitch about inline sourcemaps, don't know why...
      // sourceMap: directives.run !== "clipboard" && { url: "inline" },
    });
    if (result.error) {
      console.error(`> ERROR (skipping script): ->`, result.error, "\n");
    } else if (result.warnings) {
      console.warn(result.warnings.map((w) => `> ${w}`).join("\n"), "\n");
    } else {
      console.log("> SUCCESS\n");
    }

    processedContent = result.code;
  }

  return {
    directives,
    ext,
    exports,
    fileName,
    id: snakeTo(fileNameParts.join("."), "-"),
    content: processedContent,
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
    return `\`${value.replaceAll(/(`|\$|\\)/g, "\\$1")}\``;
  } else {
    return String(value);
  }
};

const snakeTo = (string: string, glue: string) => string.replaceAll(/_/g, glue);

const capitalize = (string: string) =>
  string[0].toUpperCase() + string.slice(1);

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
  const folders = [PUBLIC_FOLDER];
  if (existsSync(LOCAL_FOLDER)) {
    folders.push(LOCAL_FOLDER);
  }
  const scriptInfo = await Promise.all(folders.map(readScripts));
  const char = (info: ScriptInfo) => (info.title[0] || "").toLowerCase();
  return scriptInfo
    .flat()
    .filter((info) => !info.directives.ignore)
    .sort((a, b) => (char(a) > char(b) ? 1 : char(a) < char(b) ? -1 : 0));
};

// Script builders
export const buildJsScript = (info: ScriptInfo) => {
  const relevantInfo: Partial<ScriptInfo> = { ...info };
  if (relevantInfo.directives!.run !== "clipboard") {
    delete relevantInfo.content;
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
