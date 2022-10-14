// Current browser API
export const browser = (window as any).browser || (window as any).chrome;

if (!browser.scripting) {
  console.warn("Scripting service not available.");
  browser.scripting = {
    executeScript: ({ target, files }: { target: string; files: string[] }) =>
      console.debug(
        `Executed scripts "${files.join(", ")}" on target:`,
        target
      ),
  };
}

if (!browser.storage) {
  console.warn("Storage service not available.");
  const storage = new Map();
  browser.storage = {
    sync: {
      get: (...keys: string[]) =>
        keys.reduce((r, k) => ({ ...r, [k]: storage.get(k) }), {}),
      remove: (...keys: string[]) => {
        keys.forEach((k) => storage.delete(k));
        console.debug("Storage: remove", keys);
      },
      set: (values: Record<string, any>) => {
        Object.entries(values).forEach(([k, v]) => storage.set(k, v));
        console.debug("Storage: set", { values });
      },
    },
  };
}

if (!browser.tabs) {
  console.warn("Tabs service not available.");
  browser.tabs = {
    query: () => [{ id: Symbol("newId") }],
  };
}
