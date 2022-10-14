export interface Directives {
  autorun: boolean;
  description?: string;
  icon?: string;
  ignore?: boolean;
  use?: string;
  requires?: string;
  run: "clipboard" | boolean;
  website?: string;
  wrapper: "iife" | "observer" | false;
}

export interface ScriptInfo {
  content?: string;
  directives: Directives;
  exports: Exports;
  ext: string;
  fileName: string;
  id: string;
  path: string[];
  title: string;
}

export type Exports = Record<string, "function" | "object">;

export const scripts: ScriptInfo[] = [
  /* scripts */
];
