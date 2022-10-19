export interface ScriptDirectives {
  autorun: boolean;
  delay?: number;
  description?: string;
  exports: Record<string, ScriptExportType>;
  icon?: string;
  ignore?: boolean;
  pattern?: RegExp;
  requires?: string;
  run: ScriptRunOption;
  title: string;
  uwu?: boolean;
  website?: string;
  wrapper: ScriptWrapper;
}

export interface ScriptInfo {
  content?: string;
  directives: ScriptDirectives;
  fileName: string;
  path: string[];
}

type ScriptExportType = "function" | "object";
type ScriptRunOption = "clipboard" | boolean;
type ScriptWrapper = "iife" | "observer" | false;

export const scripts: ScriptInfo[] = [
  /* scripts */
];
