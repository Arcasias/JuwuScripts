/* global globalThis */
const { scripting, storage, tabs } = globalThis.browser || globalThis.chrome;

const BLACKLISTED_URL = /^(chrome|file):\/\//i;
const DEBUG_KEY = "[DEBUG]";
const SCRIPTS_PATH = "./extension/scripts/";

const onPageLoad = async ({ url, id }) => {
  let storageScripts = {};
  let debug = false;

  try {
    storageScripts = await storage.sync.get();
  } catch (err) {
    return console.error(`Error while fetching storage for url "${url}"`, err);
  }

  if (DEBUG_KEY in storageScripts) {
    debug = storageScripts[DEBUG_KEY];
    delete storageScripts[DEBUG_KEY];
  }

  const scripts = Object.values(storageScripts).filter(
    ({ hostName }) => !hostName || url.includes(hostName)
  );
  if (!scripts.length) {
    return;
  }

  try {
    await scripting.executeScript({
      target: { tabId: id },
      files: scripts.map(
        (s) => SCRIPTS_PATH + (debug ? s.fileName : s.minFileName)
      ),
      world: "MAIN",
    });
  } catch (err) {
    return console.error(`Error while executing scripts on url "${url}"`, err);
  }

  console.debug(
    `Executed the following scripts on url "${url}":`,
    scripts.map(({ id }) => id)
  );
};

tabs.onUpdated.addListener((_tabId, { status }, tab) => {
  if (status === "complete" && !BLACKLISTED_URL.test(tab.url)) {
    onPageLoad(tab);
  }
});
