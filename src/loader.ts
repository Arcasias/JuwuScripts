import { readFile, writeFile } from "fs/promises";
import {
  buildJsScript,
  buildMdIndexEntry,
  buildMdScript,
  getScriptInfos,
  jsComment,
  mdComment,
  ScriptInfo,
} from "./utils";

const README_TEMPLATE_PATH = "./templates/README.md";
const README_PATH = "./README.md";

const POPUP_JS_TEMPLATE_PATH = "./templates/scripts.js";
const POPUP_JS_PATH = "./extension/src/scripts.js";

const buildREADME = async (scriptInfos: ScriptInfo[]) => {
  const template = await readFile(README_TEMPLATE_PATH, "utf8");
  const indexEntries = scriptInfos.map(buildMdIndexEntry);
  const scripts = scriptInfos.map(buildMdScript);
  const fileContent = template
    .replace(mdComment("index"), indexEntries.join("\n"))
    .replace(mdComment("scripts"), scripts.join("\n<br>\n"));
  await writeFile(README_PATH, fileContent);
};

const buildPopupJs = async (scriptInfos: ScriptInfo[]) => {
  const template = await readFile(POPUP_JS_TEMPLATE_PATH, "utf8");
  const scripts = scriptInfos.map(buildJsScript);
  const fileContent = template.replace(jsComment("scripts"), scripts.join(","));
  await writeFile(POPUP_JS_PATH, fileContent);
};

// Main
(async () => {
  const startTime = Date.now();
  const scriptInfos = await getScriptInfos();
  await Promise.all(
    [buildREADME, buildPopupJs].map((builder) => builder(scriptInfos))
  );
  console.log(`Scripts finished building in`, Date.now() - startTime, "ms");
})();
