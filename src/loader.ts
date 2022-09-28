import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import {
  buildJsScript,
  buildMdIndexEntry,
  getScriptInfos,
  jsComment,
  mdComment,
  ScriptInfo,
} from "./utils";
import { join } from "path";

const README_TEMPLATE_PATH = "./templates/README.md";
const README_PATH = "./README.md";

const POPUP_JS_TEMPLATE_PATH = "./templates/scripts.js";
const POPUP_JS_PATH = "./extension/src/scripts.js";

const MIN_SCRIPTS_PATH = "./extension/scripts";

const buildREADME = async (scriptInfos: ScriptInfo[]) => {
  const template = await readFile(README_TEMPLATE_PATH, "utf8");
  const indexEntries = scriptInfos.map(buildMdIndexEntry);
  const fileContent = template.replace(
    mdComment("scripts"),
    indexEntries.join("\n")
  );
  await writeFile(README_PATH, fileContent);
};

const buildPopupJs = async (scriptInfos: ScriptInfo[]) => {
  const template = await readFile(POPUP_JS_TEMPLATE_PATH, "utf8");
  const scripts = scriptInfos.map(buildJsScript);
  const fileContent = template.replace(jsComment("scripts"), scripts.join(","));
  await writeFile(POPUP_JS_PATH, fileContent);
};

const minifyScripts = async (scriptInfos: ScriptInfo[]) => {
  if (!existsSync(MIN_SCRIPTS_PATH)) {
    await mkdir(MIN_SCRIPTS_PATH);
  }
  await Promise.all(
    scriptInfos.map((script) =>
      writeFile(join(MIN_SCRIPTS_PATH, script.fileName), script.content)
    )
  );
};

// Main
(async () => {
  const startTime = Date.now();
  const scriptInfos = await getScriptInfos();
  await Promise.all(
    [buildREADME, buildPopupJs, minifyScripts].map((fn) => fn(scriptInfos))
  );
  console.log(`Scripts finished building in`, Date.now() - startTime, "ms");
})();
