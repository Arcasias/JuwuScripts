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
  const storage = new Map<string, any>();
  return {
    sync: {
      get: async (...keys: string[]) =>
        keys.reduce((r, k) => ({ ...r, [k]: storage.get(k) }), {}),
      remove: async (...keys: string[]) => {
        keys.forEach((k) => storage.delete(k));
        console.debug("Storage: remove", keys);
      },
      set: async (values: Record<string, any>) => {
        Object.entries(values).forEach(([k, v]) => storage.set(k, v));
        console.debug("Storage: set", values);
      },
    },
  };
});

ensureService("tabs", () => ({
  query: async () => [{ id: "1", url: window.location.href }],
}));
