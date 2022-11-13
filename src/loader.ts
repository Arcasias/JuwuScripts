import { existsSync } from "fs";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import Jimp from "jimp";
import { join } from "path";
import {
  asyncExec,
  buildContent,
  getCLIArg,
  getManifestContent,
  getScriptInfos,
  getScriptURL,
  isPublic,
  jsComment,
  mdComment,
  ScriptBuildInfo,
  serialize,
} from "./build_helpers";
import { ScriptInfo } from "./templates/scripts";

// Helpers

// Builders
const buildBackground = async () => {
  const compileCommand = [
    "npx tsc",
    BACKGROUND_TEMPLATE_PATH,
    "--outfile",
    BACKGROUND_PATH,
    "--target ESNext && uglifyjs ./extension/background.js -o ./extension/background.js",
  ].join(" ");
  console.debug("Executing shell command:", compileCommand);
  const compileResult = await asyncExec(compileCommand);
  if (compileResult.stderr) {
    console.log(
      "Error while building extension background script:",
      compileResult.stderr
    );
  } else {
    console.log(
      "Extension background script successfuly built",
      compileResult.stdout
    );
  }

  const minifyCommand = [
    "npx uglifyjs",
    BACKGROUND_PATH,
    "-o",
    BACKGROUND_PATH,
  ].join(" ");
  console.debug("Executing shell command:", minifyCommand);
  const minifyResult = await asyncExec(minifyCommand);
  if (minifyResult.stderr) {
    console.log(
      "Error while minifying extension background script:",
      minifyResult.stderr
    );
  } else {
    console.log(
      "Extension background script successfuly minified",
      minifyResult.stdout
    );
  }
};

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

const buildManifests = async () => {
  const content = await getManifestContent(MANIFEST_TEMPLATE_PATH);
  await writeFile(MANIFEST_PATH, JSON.stringify(content, null, 2));
  console.log("Manifests v3 successfully built");
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
  const scriptInfos = await getScriptInfos(BUILT_SCRIPTS_TEMPLATE_PATH);
  await Promise.all(
    [buildREADME, buildScriptInfos, buildScriptContents].map((fn) =>
      fn(scriptInfos)
    )
  );
  console.log(`Scripts finished building in`, Date.now() - startTime, "ms");
};

// Paths
const BACKGROUND_PATH = "./extension/background.js";
const BACKGROUND_TEMPLATE_PATH = "./src/templates/background.ts";

const BUILT_SCRIPTS_PATH = "./extension/scripts";
const BUILT_SCRIPTS_TEMPLATE_PATH = getCLIArg("--scripts", "-s") || "./scripts";

const ICON_PATH = "./extension";
const ICON_TEMPLATE_PATH = "./src/templates/icon.png";

const MANIFEST_PATH = "./extension/manifest.json";
const MANIFEST_TEMPLATE_PATH = "./src/templates/manifest.json";

const POPUP_SCRIPTS_PATH = "./extension/src/scripts.ts";
const POPUP_SCRIPTS_TEMPLATE_PATH = "./src/templates/scripts.ts";

const README_PATH = "./README.md";
const README_TEMPLATE_PATH = "./src/templates/README.md";

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
  await Promise.all([
    buildBackground(),
    buildIcons(),
    buildManifests(),
    buildScripts(),
  ]);
  console.log("Loader finished in", Date.now() - startTime, "ms");
})();
