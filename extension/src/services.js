/*global chrome*/

const makeDummyScripting = () => {
  console.warn("Scripting service not available.");
  return {
    executeScript({ target, files }) {
      console.debug(
        `Executed scripts "${files.join(", ")}" on target:`,
        target
      );
    },
  };
};

const makeDummyStorage = () => {
  console.warn("Storage service not available.");
  const items = new Map();
  return {
    sync: {
      async get(...keys) {
        const result = {};
        for (const key of keys) {
          result[key] = items.get(key);
        }
        return result;
      },
      async set(values) {
        for (const [key, value] of Object.entries(values)) {
          items.set(key, value);
        }
      },
      async remove(...keys) {
        for (const key of keys) {
          items.delete(key);
        }
      },
    },
  };
};

const makeDummyTabs = () => {
  return {
    async query() {
      return [{ id: Symbol("newId") }];
    },
  };
};

export const scripting = chrome.scripting || makeDummyScripting();

export const storage = chrome.storage || makeDummyStorage();

export const tabs = chrome.tabs || makeDummyTabs();
