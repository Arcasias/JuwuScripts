import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { minify } from "uglify-js";

type Directive = "description" | "result" | "use" | "website";

export interface ScriptInfo {
  id: string;
  fileName: string;
  ext: string;
  title: string;
  directives: Record<Directive, string>;
  content: string;
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
  const directives: Record<string, string> = {};

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
          directives[name!.trim()] = content!.trim();
        } else {
          title.push(trimmed);
        }
      } else if (COMMENT_START.test(line)) {
        started = true;
      }
    }
  }

  console.log("Minifying file:", fileName);
  const content = lines
    .slice(startingLine)
    .filter(filterEmpty)
    .map(cleanLine)
    .join("\n");
  const result = minify(content, { warnings: "verbose" });
  if (result.error) {
    console.error(`> ERROR (skipping script): ->`, result.error, "\n");
  } else if (result.warnings) {
    console.warn(result.warnings.map((w) => `> ${w}`).join("\n"), "\n");
  } else {
    console.log("> SUCCESS\n");
  }

  return {
    id: fileNameParts.join(".").replace(/_/, "-"),
    fileName,
    ext,
    title: title.filter(filterEmpty).join(" "),
    directives,
    content: result.code,
  };
};

const serializeObject = (obj: Record<any, any>): string => {
  const serialized = Object.entries(obj).map(([key, value]) => {
    const serializedValue =
      typeof value === "object" && value
        ? serializeObject(value)
        : `\`${String(value).replace(/(`|\$)/g, "\\$1")}\``;
    return `"${key}":${serializedValue}`;
  });
  return `{${serialized.join(",")}}`;
};

export const getScriptInfos = async () => {
  const scriptFileNames = await readdir(SRC_FOLDER);
  const filteredNames = scriptFileNames.filter(isSupported);
  const scriptInfo = await Promise.all(filteredNames.map(readScript));
  return scriptInfo.sort((a, b) =>
    a.title > b.title ? 1 : a.title < b.title ? -1 : 0
  );
};

// Script builders
export const buildJsScript = (info: ScriptInfo) => serializeObject(info);

export const buildMdScript = ({
  id,
  fileName,
  ext,
  title,
  directives,
  content,
}: ScriptInfo) => {
  const additionalInfos = [];
  if (directives.website) {
    additionalInfos.push(`- Works on: ${directives.website}`);
  }
  if (directives.use) {
    additionalInfos.push(`- Use: ${directives.use}`);
  }
  if (directives.result) {
    const fns = directives.result.split(/[&,]/).map((x) => `\`${x.trim()}\``);
    const sing = fns.length === 1;
    additionalInfos.push(
      `- This script defines the function${sing ? "" : "s"} ${[
        fns.slice(0, -1).join(", "),
        fns[fns.length - 1],
      ]
        .filter(filterEmpty)
        .join(" and ")}. You have to call ${sing ? "it" : "them"} to see ${
        sing ? "its" : "their"
      } effects.`
    );
  }

  const gitHubLink = [GITHUB_URL, SRC_FOLDER, fileName].join("/");

  return `
## <a name="${id}">[${title}](${gitHubLink})</a>

${directives.description || ""}

${additionalInfos.join("\n")}

\`\`\`${ext}
${content}
\`\`\`

`;
};

// Index builders
export const buildMdIndexEntry = ({ id, title }: ScriptInfo) =>
  `- [${title}](#${id})`;

// Comment builders
export const jsComment = (comment: string) => `/* ${comment} */`;
export const htmlComment = (comment: string) => `<!-- ${comment} -->`;
export const mdComment = htmlComment;
