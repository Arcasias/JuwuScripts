const makeDummyScripting = () => {
  console.warn("Scripting service not available.");
  return {
    executeScript: ({ target, files }) =>
      console.debug(
        `Executed scripts "${files.join(", ")}" on target:`,
        target
      ),
  };
};

const makeDummyStorage = () => {
  console.warn("Storage service not available.");
  const storage = new Storage();
  return {
    sync: {
      get: (...keys) =>
        keys.reduce((r, k) => ({ ...r, [k]: storage.getItem(k) }), {}),
      set: (values) =>
        Object.entries(values).forEach(([k, v]) => storage.setItem(k, v)),
      remove: (...keys) => keys.forEach((k) => storage.removeItem(k)),
    },
  };
};

const makeDummyTabs = () => {
  return {
    query: () => [{ id: Symbol("newId") }],
  };
};

export const scripting = (window.browser || window.chrome).scripting || makeDummyScripting();

export const storage = (window.browser || window.chrome).storage || makeDummyStorage();

export const tabs = (window.browser || window.chrome).tabs || makeDummyTabs();
