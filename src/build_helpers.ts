import archiver from "archiver";
import { exec } from "child_process";
import { createWriteStream, statSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { minify } from "uglify-js";
import { promisify } from "util";
import { ScriptDirectives, ScriptInfo } from "./templates/scripts";

interface ArchiveContent {
  files: (string | [string, string])[];
  folders: string[];
}

interface WrapperOptions {
  async?: boolean;
}

export type IconFileName = `icon${number}.png`;
export type ScriptBuildInfo = ScriptInfo & { content: string };

export const asyncExec = promisify(exec);

export const buildContent = (
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

export const getCLIArg = <T extends string>(...options: string[]): T | null => {
  for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (options.includes(arg)) {
      return process.argv[i + 1] as T;
    }
  }
  return null;
};

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

export const getManifestContent = async (sourcePath: `${string}.json`) => {
  const stringContent = await readFile(sourcePath, "utf-8");
  const content = JSON.parse(stringContent) as Record<string, any>;
  if (Array.isArray(content.icons)) {
    const icons: Record<string, IconFileName> = {};
    for (const icon of content.icons) {
      icons[String(icon)] = makeIconFileName(icon);
    }
    content.icons = icons;
  }
  return content;
};

export const getScriptInfos = async (path: string) => {
  const scriptInfo: ScriptBuildInfo[] = [];
  await readScripts(join(path), scriptInfo);
  return sortBy(scriptInfo, (s) => s.directives.title.toLowerCase());
};

export const getScriptURL = ({ fileName, path }: ScriptBuildInfo) => {
  const encoded = path.map(encodeURIComponent);
  return [GITHUB_URL, ...encoded, encodeURIComponent(fileName)].join("/");
};

const isFalse = (value: string) => /^(disabled|none|false)$/i.test(value);

const isNotEmpty = (line?: string) => line?.length && !/^[\s\r\n]+$/.test(line);

export const isPublic = (script: ScriptInfo) => !script.path.includes("local");

const isScriptFile = (fileName: string) => /.(js|ts)$/.test(fileName);

const isTrue = (value: string) =>
  !value.length || /^(enabled|true)$/.test(value);

export const jsComment = (comment: string) => `/* ${comment} */`;

export const makeArchive = (
  sourceDir: string,
  archiveName: string,
  content: ArchiveContent
) => {
  const output = createWriteStream(archiveName);
  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  output.on("close", () => {
    console.log(`${archive.pointer()} total bytes`);
    console.log(
      "archiver has been finalized and the output file descriptor has closed."
    );
  });

  output.on("end", () => {
    console.log("Data has been drained");
  });

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  for (let fileName of content.files) {
    let alias: string;
    if (Array.isArray(fileName)) {
      [fileName, alias] = fileName;
    } else {
      alias = fileName;
    }
    const filePath = join(sourceDir, fileName);
    console.log(`Added file "${filePath}" as "${alias}"`);
    archive.file(filePath, { name: alias });
  }

  for (const folderName of content.folders) {
    const folderPath = join(sourceDir, folderName, "");
    console.log(`Added folder "${folderPath}" as "${folderName}"`);
    archive.directory(folderPath, folderName);
  }

  archive.finalize();
};

export const mdComment = (comment: string) => `[//]: # (${comment})`;

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

export const serialize = (value: any): string => {
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

const makeIconFileName = (size: number): IconFileName => `icon${size}.png`;

// String constants
const CONTENT_PLACEHOLDER = "scripts";
const GITHUB_URL = "https://github.com/Arcasias/scripts/blob/master";
const TEMPLATE_WARNING = "⚠️ PRODUCTION FILE: DO NOT EDIT ⚠️";

// Regular expressions
const COMMENT_START = /^\s*\/\*\*?/;
const COMMENT_LINE = /^\s*\*/;
const COMMENT_END = /\*\/\s*$/;
const DIRECTIVE = /@([\w-]+)(.*)?/;
