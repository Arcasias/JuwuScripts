import { existsSync, statSync } from "fs";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import { join } from "path";
import { minify } from "uglify-js";
import { Directives, Exports, ScriptInfo } from "./templates/scripts";

interface WrapperOptions {
  async?: boolean;
}

type ScriptBuildInfo = ScriptInfo & { content: string };

// Paths
const README_TEMPLATE_PATH = "./templates/README.md";
const README_PATH = "./README.md";

const POPUP_JS_TEMPLATE_PATH = "./templates/scripts.ts";
const POPUP_JS_PATH = "./extension/src/scripts.ts";

const BUILT_SCRIPTS_PATH = "./extension/scripts";

// String constants
const ROOT_PATH = "src";
const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";

// Regular expressions
const COMMENT_START = /^\s*\/\*/;
const COMMENT_LINE = /^\s*\*/;
const COMMENT_END = /\*\/\s*$/;
const DIRECTIVE = /@([\w-]+)(.*)?/;

// Helpers
const camelTo = (string: string, glue: string) =>
  string.replaceAll(/([a-z])([A-Z])/g, (_, a, b) => a + glue + b.toLowerCase());

const capitalize = (string: string) =>
  string[0].toUpperCase() + string.slice(1);

const cleanLine = (line: string) => line.replaceAll(/[\r\n]+/g, "");

const getScriptInfos = async () => {
  const scriptInfo: ScriptBuildInfo[] = [];
  await readScripts(ROOT_PATH, scriptInfo);
  const char = (info: ScriptBuildInfo) => (info.title[0] || "").toLowerCase();
  return scriptInfo.sort((a, b) =>
    char(a) > char(b) ? 1 : char(a) < char(b) ? -1 : 0
  );
};

const getScriptURL = ({ fileName, path }: ScriptBuildInfo) =>
  [GITHUB_URL, ...path, fileName].join("/");

const isFalse = (expr: string) =>
  /^(no|none|false|null|undefined|0)$/i.test(expr);

const isScriptFile = (fileName: string) => /.(js|ts)$/.test(fileName);

const isTrue = (expr: string) => /^(yes|true|1)$/i.test(expr);

const jsComment = (comment: string) => `/* ${comment} */`;

const filterEmpty = (line?: string) =>
  line?.length && !/^[\s\r\n]+$/.test(line);

const mdComment = (comment: string) => `<!-- ${comment} -->`;

const readScript = async (
  path: string,
  fileName: string
): Promise<ScriptBuildInfo> => {
  const scriptContent = await readFile(join(path, fileName), "utf8");
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
        const dirName = name.trim() as keyof Directives;
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
    path: path.split(/[\\\/]/),
  };
};

const readScripts = async (folder: string, scripts: ScriptBuildInfo[]) => {
  const itemNames = await readdir(folder);
  await Promise.all(
    itemNames.map(async (name) => {
      const path = join(folder, name);
      if (statSync(path).isDirectory()) {
        await readScripts(path, scripts);
      } else if (isScriptFile(name)) {
        const scriptInfo = await readScript(folder, name);
        if (!scriptInfo.directives.ignore) {
          scripts.push(scriptInfo);
        }
      }
    })
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

// Builders
const buildJsScript = (info: ScriptBuildInfo) => {
  const relevantInfo: ScriptInfo = { ...info };
  if (relevantInfo.directives!.run !== "clipboard") {
    delete relevantInfo.content;
  }
  return serialize(relevantInfo);
};

const buildMdIndexEntry = (scriptInfo: ScriptBuildInfo) =>
  `- [${scriptInfo.title}](${getScriptURL(scriptInfo)})`;

const buildREADME = async (scriptInfos: ScriptBuildInfo[]) => {
  const template = await readFile(README_TEMPLATE_PATH, "utf8");
  const indexEntries = scriptInfos
    .filter((info) => !info.path.includes("local")) // Only considers public scripts in the README
    .map(buildMdIndexEntry);
  const fileContent = template.replace(
    mdComment("scripts"),
    indexEntries.join("\n")
  );
  await writeFile(README_PATH, fileContent);
};

const buildPopupJs = async (scriptInfos: ScriptBuildInfo[]) => {
  const template = await readFile(POPUP_JS_TEMPLATE_PATH, "utf8");
  const scripts = scriptInfos.map(buildJsScript);
  const fileContent = template.replace(
    jsComment("scripts"),
    scripts.join(",\n  ")
  );
  await writeFile(POPUP_JS_PATH, fileContent);
};

const buildScripts = async (scriptInfos: ScriptBuildInfo[]) => {
  if (existsSync(BUILT_SCRIPTS_PATH)) {
    await rm(BUILT_SCRIPTS_PATH, { recursive: true });
  }
  await mkdir(BUILT_SCRIPTS_PATH);
  await Promise.all(
    scriptInfos.map(({ fileName, content }) =>
      writeFile(join(BUILT_SCRIPTS_PATH, fileName), content)
    )
  );
};

// Main
(async () => {
  const startTime = Date.now();
  const scriptInfos = await getScriptInfos();
  await Promise.all(
    [buildREADME, buildPopupJs, buildScripts].map((fn) => fn(scriptInfos))
  );
  console.log(`Scripts finished building in`, Date.now() - startTime, "ms");
})();
