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
  const storage = new Map();
  return {
    sync: {
      get: (...keys) =>
        keys.reduce((r, k) => ({ ...r, [k]: storage.get(k) }), {}),
      set: (values) =>
        Object.entries(values).forEach(([k, v]) => storage.set(k, v)),
      remove: (...keys) => keys.forEach((k) => storage.delete(k)),
    },
  };
};

const makeDummyTabs = () => {
  return {
    query: () => [{ id: Symbol("newId") }],
  };
};

export const scripting =
  (window.browser || window.chrome).scripting || makeDummyScripting();

export const storage =
  (window.browser || window.chrome).storage || makeDummyStorage();

export const tabs = (window.browser || window.chrome).tabs || makeDummyTabs();
