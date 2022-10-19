// Current browser API
if (!globalThis.chrome) {
  globalThis.chrome = (globalThis as any).browser;
}

export const browser = globalThis.chrome;

const ensureService = <T extends keyof typeof chrome>(
  name: T,
  factory: () => any
) => {
  if (!browser[name]) {
    console.debug(`Service "${name}" unavailable.`);
    browser[name] = factory();
  }
};

ensureService("runtime", () => ({
  sendMessage: async (payload: any) => {
    console.debug("Message sent:", payload);
  },
}));

ensureService("storage", () => {
  const PREFIX = "--browser-storage-";
  const ensureKeys = (keys?: string | string[]) => {
    keys ||= Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .map((k) => k.slice(PREFIX.length));
    return Array.isArray(keys) ? keys : [keys];
  };
  return {
    sync: {
      get: async (keys?: string | string[]) =>
        ensureKeys(keys).reduce((prev, curr) => {
          const value = localStorage.getItem(PREFIX + curr);
          return { ...prev, [curr]: value && JSON.parse(value) };
        }, {}),
      remove: async (keys: string | string[]) => {
        ensureKeys(keys).forEach((k) => localStorage.removeItem(PREFIX + k));
        console.debug("Storage: remove", keys);
      },
      set: async (values: Record<string, any>) => {
        Object.entries(values).forEach(([k, v]) =>
          localStorage.setItem(PREFIX + k, JSON.stringify(v))
        );
        console.debug("Storage: set", values);
      },
    },
  };
});

ensureService("tabs", () => ({
  query: async () => [{ id: "1", url: window.location.href }],
}));
