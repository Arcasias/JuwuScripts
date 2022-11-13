import archiver from "archiver";
import { createWriteStream } from "fs";
import { join } from "path";

const EXPORTED_FILES = [
  "background.js",
  "manifest.json",
  "icon16.png",
  "icon48.png",
  "icon128.png",
];
const EXPORTED_FOLDERS = ["build", "src/img", "scripts"];
const SOURCE_DIR = "./extension";
const TARGET_FILE = "./extension.zip";

(async () => {
  const output = createWriteStream(TARGET_FILE);
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

  for (const fileName of EXPORTED_FILES) {
    const filePath = join(SOURCE_DIR, fileName);
    console.log(`Added file "${filePath}" as "${fileName}"`);
    archive.file(filePath, { name: fileName });
  }

  for (const folderName of EXPORTED_FOLDERS) {
    const folderPath = join(SOURCE_DIR, folderName, "");
    console.log(`Added folder "${folderPath}" as "${folderName}"`);
    archive.directory(folderPath, folderName);
  }

  archive.finalize();
})();
