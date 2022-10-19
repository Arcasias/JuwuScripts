import { existsSync, statSync } from "fs";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import Jimp from "jimp";
import { join } from "path";
import { minify } from "uglify-js";
import { ScriptDirectives, ScriptInfo } from "./src/scripts";

interface WrapperOptions {
  async?: boolean;
}

type ScriptBuildInfo = ScriptInfo & { content: string };

// Helpers
const buildContent = (
  template: string,
  content: string,
  commentFactory: (text: string) => string
) =>
  [
    commentFactory(TEMPLATE_WARNING),
    template.replace(commentFactory(CONTENT_PLACEHOLDER), content),
  ].join("\n");

const camelTo = (string: string, glue: string) =>
  string.replaceAll(/([a-z])([A-Z])/g, (_, a, b) => a + glue + b.toLowerCase());

const capitalize = (string: string) =>
  string[0].toUpperCase() + string.slice(1);

const cleanLine = (line: string) => line.replaceAll(/[\r\n]+/g, "");

const getDefaultDirectives = (): ScriptDirectives => ({
  autorun: true,
  exports: {},
  run: true,
  title: "",
  wrapper: "iife",
});

const getDefaultTitle = (fileName: string) =>
  capitalize(
    camelTo(snakeTo(fileName.split(".").slice(0, -1).join(" "), " "), " ")
  );

const getScriptInfos = async () => {
  const scriptInfo: ScriptBuildInfo[] = [];
  await readScripts(join(ROOT_PATH), scriptInfo);
  return sortBy(scriptInfo, (s) => s.directives.title.toLowerCase());
};

const getScriptURL = ({ fileName, path }: ScriptBuildInfo) => {
  const encoded = path.map(encodeURIComponent);
  return [GITHUB_URL, ...encoded, encodeURIComponent(fileName)].join("/");
};

const isFalse = (value: string) => /^(disabled|none|false)$/i.test(value);

const isNotEmpty = (line?: string) => line?.length && !/^[\s\r\n]+$/.test(line);

const isPublic = (script: ScriptInfo) => !script.path.includes("local");

const isScriptFile = (fileName: string) => /.(js|ts)$/.test(fileName);

const isTrue = (value: string) =>
  !value.length || /^(enabled|true)$/.test(value);

const jsComment = (comment: string) => `/* ${comment} */`;

const mdComment = (comment: string) => `[//]: # (${comment})`;

const parseCommentBlock = (lines: string[]): [ScriptDirectives, string[]] => {
  const directives = getDefaultDirectives();
  const descriptionParts: string[] = [];

  let startingLine: number = 0;
  let titleLineFound = false;
  let directiveFound = false;
  let commentFound = false;
  let parsing = false;

  for (startingLine = 0; startingLine < lines.length; startingLine++) {
    const line = lines[startingLine]!;
    let lineContent: string | null = null;

    if (COMMENT_START.test(line)) {
      commentFound = true;
      parsing = true;
      lineContent = line.replace(COMMENT_START, "").trim();
    }

    if (COMMENT_END.test(line)) {
      parsing = false;
      const content = lineContent === null ? line : lineContent;
      lineContent = content.replace(COMMENT_END, "").trim();
      startingLine++; // Skip current line
    }

    if (commentFound) {
      if (lineContent === null) {
        lineContent = line.replace(COMMENT_LINE, "").trim();
      }
      const directiveMatch = lineContent.match(DIRECTIVE);
      if (directiveMatch) {
        directiveFound = true;

        // Parse directive
        const [, name, content] = directiveMatch;
        const dirName = name.trim() as keyof ScriptDirectives;
        let dirValue: string | boolean | number | RegExp = (
          content || ""
        ).trim();
        if (dirName === "pattern") {
          dirValue = new RegExp(dirValue, "i");
        } else if (dirValue && !isNaN(Number(dirValue))) {
          dirValue = Number(dirValue);
        } else if (isFalse(dirValue)) {
          dirValue = false;
        } else if (isTrue(dirValue)) {
          dirValue = true;
        }
        (<any>directives)[dirName] = dirValue;
      } else if (isNotEmpty(lineContent) && !directiveFound) {
        // Either "title" (first non-directive line) or part of "description"
        // This stops after the first directive.
        if (titleLineFound) {
          descriptionParts.push(lineContent);
        } else {
          directives.title = capitalize(lineContent);
          titleLineFound = true;
        }
      }
    }
    if (!parsing) {
      break;
    }
  }

  if (descriptionParts.length) {
    directives.description = descriptionParts.join(" ");
  }

  const contentLines = lines
    .slice(commentFound ? startingLine : 0)
    .filter(isNotEmpty);

  return [directives as ScriptDirectives, contentLines];
};

const readScript = async (
  path: string,
  fileName: string
): Promise<ScriptBuildInfo> => {
  const scriptContent = await readFile(join(path, fileName), "utf8");
  const lines = scriptContent.split("\n");

  // Extract directives and content lines
  const [directives, contentLines] = parseCommentBlock(lines);
  directives.title ||= getDefaultTitle(fileName);

  let content = contentLines.map(cleanLine).join("\n");

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
  content = content.replaceAll(
    /\bexport\s+(const|let|var|function)\s+([\w-]+)?\s*=?\s*(\()?/g,
    (_, keyword, exportedTerm, parenthesis) => {
      const isFunction = parenthesis || keyword === "function";
      directives.exports[exportedTerm] = isFunction ? "function" : "object";
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
      sourceMap: directives.run !== "clipboard" && { url: "inline" },
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
    content: processedContent,
    directives,
    fileName,
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
  } else if (value && typeof value === "object" && !(value instanceof RegExp)) {
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

const sortBy = <T>(list: T[], value: (element: T) => string | number) =>
  list.sort((a, b) => (value(a) > value(b) ? 1 : value(a) < value(b) ? -1 : 0));

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
const buildIcons = async () => {
  const startTime = Date.now();
  const templateIcon = await Jimp.read(ICON_TEMPLATE_PATH);
  await Promise.all(
    ICON_SIZES_AND_PATHS.map(([size, path]) => {
      const iconPath = join(ICON_PATH, path);
      return templateIcon.clone().resize(size, size).write(iconPath);
    })
  );
  console.log(`Icons finished building in`, Date.now() - startTime, "ms");
};

const buildJsScript = (info: ScriptBuildInfo) => {
  const relevantInfo: Partial<ScriptBuildInfo> = { ...info };
  if (relevantInfo.directives!.run !== "clipboard") {
    delete relevantInfo.content;
  }
  return serialize(relevantInfo as ScriptInfo);
};

const buildMdIndexEntry = (scriptInfo: ScriptBuildInfo) =>
  `- [${scriptInfo.directives.title}](${getScriptURL(scriptInfo)})`;

const buildREADME = async (scriptInfos: ScriptBuildInfo[]) => {
  const template = await readFile(README_TEMPLATE_PATH, "utf8");
  const indexEntries = scriptInfos.filter(isPublic).map(buildMdIndexEntry);
  const content = indexEntries.join("\n");

  await writeFile(README_PATH, buildContent(template, content, mdComment));
};

const buildScriptInfos = async (scriptInfos: ScriptBuildInfo[]) => {
  const template = await readFile(POPUP_SCRIPTS_TEMPLATE_PATH, "utf8");
  const scripts = scriptInfos.map(buildJsScript);
  const content = scripts.join(",\n  ");

  await writeFile(
    POPUP_SCRIPTS_PATH,
    buildContent(template, content, jsComment)
  );
};

const buildScriptContents = async (scriptInfos: ScriptBuildInfo[]) => {
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

const buildScripts = async () => {
  const startTime = Date.now();
  const scriptInfos = await getScriptInfos();
  await Promise.all(
    [buildREADME, buildScriptInfos, buildScriptContents].map((fn) =>
      fn(scriptInfos)
    )
  );
  console.log(`Scripts finished building in`, Date.now() - startTime, "ms");
};

// Paths
const BUILT_SCRIPTS_PATH = "./extension/scripts";

const ICON_PATH = "./extension";
const ICON_TEMPLATE_PATH = "./src/icon.png";

const POPUP_SCRIPTS_PATH = "./extension/src/scripts.ts";
const POPUP_SCRIPTS_TEMPLATE_PATH = "./src/scripts.ts";

const README_PATH = "./README.md";
const README_TEMPLATE_PATH = "./src/README.md";

// String constants
const CONTENT_PLACEHOLDER = "scripts";
const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";
const ROOT_PATH = process.argv[2] || "./scripts";
const TEMPLATE_WARNING = "⚠️ PRODUCTION FILE: DO NOT EDIT ⚠️";

// Regular expressions
const COMMENT_START = /^\s*\/\*\*?/;
const COMMENT_LINE = /^\s*\*/;
const COMMENT_END = /\*\/\s*$/;
const DIRECTIVE = /@([\w-]+)(.*)?/;

// Other constants
const ICON_SIZES_AND_PATHS: [number, string][] = [
  [16, "public/favicon.ico"],
  [16, "icon16.png"],
  [48, "icon48.png"],
  [128, "icon128.png"],
];

// Main
(async () => {
  const startTime = Date.now();
  await Promise.all([buildScripts(), buildIcons()]);
  console.log("Loader finished in", Date.now() - startTime, "ms");
})();
