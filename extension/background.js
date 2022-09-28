/* global globalThis */
const BLACKLISTED_URL = /^(chrome|file):\/\//i;
const { scripting, storage, tabs } = globalThis.browser || globalThis.chrome;

const onPageLoad = async ({ url, id }) => {
  let storageScripts = {};
  try {
    storageScripts = await storage.sync.get();
  } catch (err) {
    return console.error(`Error while fetching storage for url "${url}"`, err);
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
      files: scripts.map(({ fileName }) => `./extension/scripts/${fileName}`),
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
