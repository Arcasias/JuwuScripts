interface StorageScriptInfo {
  fileName: string;
  pattern: string | false;
}

interface ExecuteScriptPayload {
  func: "executeScripts";
  args: [StorageScriptInfo[], boolean];
}

type MessagePayload = ExecuteScriptPayload;

const browser: typeof chrome = globalThis.chrome || (globalThis as any).browser;

const BLACKLISTED_URL = /^(chrome|file|about):/i;
const SCRIPTS_PATH = "./scripts/";
const tabScripts = new Map<number, Set<string>>();

const canExecute = (tab?: chrome.tabs.Tab) =>
  Boolean(tab?.id && (!tab.url || !BLACKLISTED_URL.test(tab.url)));

const checkTabActivity = async (tab: chrome.tabs.Tab) => {
  if (!tab.active) {
    tabScripts.delete(tab.id!);
    return false;
  }
  const deletedTabIds = await updateTabCounters();
  if (deletedTabIds.includes(tab.id!)) {
    console.log(
      ...logTab(tab),
      "tab was closed before scripts could be executed."
    );
    return false;
  } else {
    return true;
  }
};

const executeScripts = async (
  scripts: StorageScriptInfo[],
  tab?: chrome.tabs.Tab,
  force: boolean = false
) => {
  if (!tab?.id) {
    return;
  }

  // Applies pattern matching (if force=false)
  const filteredScripts = force
    ? scripts
    : scripts.filter(
        ({ fileName, pattern }) =>
          fileName && (!pattern || !tab.url || matchPattern(pattern, tab.url))
      );

  if (!filteredScripts.length) {
    return;
  }

  const scriptFileNames = filteredScripts.map(({ fileName }) => fileName);

  // Update counter on current tab
  const executedScripts = tabScripts.get(tab.id) || new Set();
  scriptFileNames.forEach((fileName) => executedScripts.add(fileName));
  tabScripts.set(tab.id, executedScripts);

  try {
    await Promise.all([
      updateBadge(tab.id, String(executedScripts.size)),
      browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: scriptFileNames.map((fileName) => SCRIPTS_PATH + fileName),
        world: "MAIN",
      }),
    ]);
    console.log(
      ...logTab(tab),
      "executed scripts (",
      executedScripts.size,
      ")",
      scriptFileNames
    );
  } catch (error) {
    console.error(...logTab(tab), error);
  }
};

const getStorageScripts = async (keys?: string | string[]) => {
  const values = await browser.storage.sync.get(keys);
  return Object.values(values) as StorageScriptInfo[];
};

const getTabIds = async (query: chrome.tabs.QueryInfo = {}) => {
  const tabs = await browser.tabs.query(query);
  return tabs.map((tab) => tab.id).filter(Number.isInteger) as number[];
};

const logTab = (tab: chrome.tabs.Tab) => ["[", tab.id, "] :"];

const matchPattern = (pattern: string, url: string) => {
  const [, content, flags]: string[] = pattern.match(/^\/(.+)\/(\w+)?$/)!;
  return new RegExp(content, flags).test(url);
};

const updateBadge = async (tabId: number, text: string, color = "#ffa030") => {
  await Promise.all([
    browser.action.setBadgeText({ tabId, text }),
    browser.action.setBadgeBackgroundColor({ tabId, color }),
  ]);
};

const updateTabCounters = async () => {
  const allTabIds = await getTabIds();
  const deleted: number[] = [];
  for (const tabId of tabScripts.keys()) {
    if (!allTabIds.includes(tabId)) {
      tabScripts.delete(tabId);
      deleted.push(tabId);
    }
  }
  if (deleted.length) {
    console.debug("Removed closed tabs from counters list:", deleted);
  }
  return deleted;
};

// On each tab update completed
browser.tabs.onUpdated.addListener(async (_tabId, { status }, tab) => {
  if (status !== "complete" || !canExecute(tab)) {
    return;
  }
  const storageScripts = await getStorageScripts();
  if (await checkTabActivity(tab)) {
    // Reset tab counter since it has been reloaded.
    tabScripts.set(tab.id!, new Set());
    await executeScripts(storageScripts, tab, false);
  }
});

// On runtime messages
browser.runtime.onMessage.addListener(
  async ({ func, args }: MessagePayload) => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (func === "executeScripts" && canExecute(tab)) {
      const [scripts, force] = args;
      await executeScripts(scripts, tab, force);
    }
  }
);
